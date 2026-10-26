import { SLACK_CHAT_BOT_SCOPES, SLACK_BOT_TOOL_SCOPES } from "@paperclipai/shared";
import { randomUUID, generateKeyPairSync } from "node:crypto";
import { join } from "node:path";
import { and, eq } from "drizzle-orm";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { activityLog, agentApiKeys, companies, chatEndpoints, chatExternalPrincipals, chatIdentityLinks, toolPolicies, connectionGrants, connectionGrantDelegations, toolAccessAuditEvents, toolOauthStates, issueThreadInteractions, connectionIntentDeliveries, agents, companyMemberships, heartbeatRuns, issues, principalPermissionGrants, projects, toolConnections, toolMcpGatewayTokens, plugins } from "@paperclipai/db";
import { findSatisfiedToolConnection, satisfiedConnectionIntentService } from "../services/satisfied-connection-intents.js";
import { connectionManagementService, continuingConnectionManagement } from "../services/connection-management.js";
import { redactRunnerApiPayloads } from "../services/native-runtime/runner-api-log-redaction.js";
import { createLocalAgentJwt } from "../agent-auth-jwt.js";
import { startRunnerApiTestServer } from "./helpers/runner-api-server.js";
import { configureAgentLifecycle } from "../services/agent-lifecycle.js";
import { agentService } from "../services/agents.js";
import { accessService } from "../services/access.js";
import { instanceSettingsService } from "../services/instance-settings.js";
import { PaperclipRunnerToolAuthority } from "../services/native-runtime/paperclip-runner-tool-authority.js";

vi.mock("../services/agent-lifecycle-driver.js", () => ({
  createLifecycleDriver: () => ({ requiredPluginIds: async () => [], runPlugin: async () => "complete", runHost: async () => "complete" }),
}));

// All requests traverse the assembled server and production bearer middleware.
// No req.actor injection or special permission grants establish access.
describe("connection management with production default agents", () => {
  let server: Awaited<ReturnType<typeof startRunnerApiTestServer>>;
  let lifecycle: ReturnType<typeof configureAgentLifecycle>;
  let provider: ((url: string, init?: RequestInit) => Promise<Response>) | null = null;
  let providerFetch: ReturnType<typeof vi.spyOn>;
  beforeAll(async () => {
    vi.stubEnv("PAPERCLIP_AGENT_JWT_SECRET", randomUUID());
    vi.stubEnv("PAPERCLIP_RESPONSIBLE_USER_AUTHZ_MODE", "shadow");
    vi.stubEnv("PAPERCLIP_AUTH_RATE_LIMIT_ENABLED", "false");
    const realFetch = globalThis.fetch;
    providerFetch = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);
      if (new URL(url).hostname === "127.0.0.1") return realFetch(input, init);
      if (provider) return provider(url, init);
      throw new Error("Unexpected external request in provider fixture");
    });
    server = await startRunnerApiTestServer({ authPublicBaseUrl: "https://paperclip.fixture.invalid", humanSessions: true });
    lifecycle = configureAgentLifecycle(server.db, { requiredPluginIds: async () => [], runPlugin: async () => "complete", runHost: async () => "complete" });
    vi.stubEnv("PAPERCLIP_SECRETS_MASTER_KEY_FILE", join(server.root, "master.key"));
    await instanceSettingsService(server.db).updateExperimental({ enableChatConnectors: true, enableGitHubReviewBots: true });
  }, 90_000);
  afterAll(async () => { await lifecycle?.stop(); await server?.close(); providerFetch?.mockRestore(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  async function fixture() {
    const base = await server.fixture({ connectionScenario: "fresh" });
    const userId = base.responsibleUserId!;
    const access = accessService(server.db);
    await access.ensureMembership(base.companyId, "user", userId, "operator", "active");
    await access.ensureRoleDefaultGrants(base.companyId, userId, "operator", userId);
    await server.db.update(companies).set({ requireBoardApprovalForNewAgents: false }).where(eq(companies.id, base.companyId));
    const cookie = await server.humanSession(userId);
    const created = await fetch(`${server.apiUrl}/api/companies/${base.companyId}/agents`, {
      method: "POST", headers: { cookie, "Content-Type": "application/json", origin: server.apiUrl },
      body: JSON.stringify({ name: "Fresh standard agent", role: "engineer", adapterType: "paperclip_runner", adapterConfig: { provider: "codex" },
        runtimeConfig: { heartbeat: { enabled: false, wakeOnDemand: false } }, permissions: {} }),
    });
    const agent = await created.json();
    expect(agent, JSON.stringify(agent)).toHaveProperty("id");
    expect(created.status).toBe(201);
    await lifecycle.process(agent.id);
    await vi.waitFor(async () => expect((await agentService(server.db).getById(agent.id))?.status).toBe("idle"), { timeout: 10_000 });
    await server.db.update(heartbeatRuns).set({ agentId: agent.id }).where(eq(heartbeatRuns.id, base.runId));
    await server.db.update(issues).set({ assigneeAgentId: agent.id, responsibleUserId: userId }).where(eq(issues.id, base.issueId));
    const key = await agentService(server.db).createApiKey(agent.id, "integration", { kind: "standard" }, { responsibleUserId: userId });
    const jwt = createLocalAgentJwt(agent.id, base.companyId, "paperclip_runner", base.runId, userId);
    const request = async (method: string, path: string, body?: unknown, token = key.token) => {
      const response = await fetch(server.apiUrl + (path.startsWith("/mcp/") ? "" : "/api") + path, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      return { status: response.status, body: await response.json().catch(() => null) };
    };
    return { ...base, agentId: agent.id, userId, key, jwt, request,
      authority: new PaperclipRunnerToolAuthority(server.db, { companyId: base.companyId, agentId: agent.id, issueId: base.issueId, runId: base.runId, apiUrl: server.apiUrl, storage: server.storage }) };
  }

  it("creates and configures tool connections and profiles with fresh grants and actual key/JWT authentication", async () => {
    const f = await fixture();
    const grants = await server.db.select().from(principalPermissionGrants).where(eq(principalPermissionGrants.principalId, f.agentId));
    expect(grants.some(g => g.permissionKey === "tools:admin")).toBe(false);
    expect(await f.request("GET", `/companies/${f.companyId}/tools/stdio-templates`)).toMatchObject({ status: 403 });
    const created = await f.request("POST", `/companies/${f.companyId}/tools/connections`, { name: "Fixture tool", transport: "mcp_remote", authKind: "none", transportConfig: { url: "https://1.1.1.1/mcp" } });
    expect(created, JSON.stringify(created)).toMatchObject({ status: 201 });
    expect(await f.request("PATCH", `/tool-connections/${created.body.id}`, { name: "Updated tool" }, f.jwt)).toMatchObject({ status: 200, body: { name: "Updated tool" } });
    const [saved] = await server.db.select().from(toolConnections).where(eq(toolConnections.id, created.body.id));
    expect(saved.createdByUserId).toBe(f.userId);
    const audit = await server.db.select().from(activityLog).where(eq(activityLog.entityId, saved.id));
    expect(audit).toEqual(expect.arrayContaining([expect.objectContaining({ actorType: "agent", actorId: f.agentId, responsibleUserId: f.userId,
      details: expect.objectContaining({ permissionDecision: expect.objectContaining({ action: "connections:configure", reason: expect.stringMatching(/^allow_/) }) }),
    })]));
    const profile = await f.request("POST", `/companies/${f.companyId}/tools/profiles`, { profileKey: "fixture-profile", name: "Fixture profile", defaultAction: "deny", entries: [] });
    expect(profile, JSON.stringify(profile)).toMatchObject({ status: 201 });
  });

  it("hands generic app authentication to the saved setup without creating agent-bound OAuth state", async () => {
    const f = await fixture();
    const created = await f.request("POST", `/companies/${f.companyId}/tools/connections`, {
      name: "OAuth handoff fixture", transport: "mcp_remote", authKind: "oauth", credentialPolicy: "per_user", status: "draft",
      transportConfig: { url: "https://1.1.1.1/mcp" },
    });
    expect(created, JSON.stringify(created)).toMatchObject({ status: 201 });
    const path = `/tools/oauth/${created.body.id}/start`;
    const started = await f.request("POST", path, { asCurrentUser: true });
    expect(started, JSON.stringify(started)).toMatchObject({ status: 200, body: {
      expiresAt: null, requiredUserAction: { userId: f.userId, resource: { id: created.body.id } },
    } });
    expect(new URL(started.body.authorizationUrl).searchParams.get("resume")).toBe(created.body.id);
    expect(await f.request("POST", path, { asCurrentUser: true })).toMatchObject({ status: 200, body: { authorizationUrl: started.body.authorizationUrl } });
    expect(await server.db.select().from(toolOauthStates).where(eq(toolOauthStates.connectionId, created.body.id))).toHaveLength(0);
  });

  it("delegates and revokes an owned credential with actual agent attribution", async () => {
    const f = await fixture();
    const created = await f.request("POST", `/companies/${f.companyId}/tools/connections`, {
      name: "Personal delegation fixture", transport: "mcp_remote", authKind: "none", credentialPolicy: "per_user",
      transportConfig: { url: "https://1.1.1.1/mcp" },
    });
    expect(created.status).toBe(201);
    // Provider fixture: a completed personal credential, not principal permissions.
    const [grant] = await server.db.insert(connectionGrants).values({ companyId: f.companyId,
      connectionId: created.body.id, kind: "user", subjectUserId: f.userId, status: "active",
      credentialSecretRefs: [], createdByUserId: f.userId,
    }).returning();
    const path = `/tool-connections/${created.body.id}/grants/${grant.id}/delegations`;
    const delegated = await f.request("POST", path, { agentId: f.agentId });
    expect(delegated, JSON.stringify(delegated)).toMatchObject({ status: 201 });
    expect(await f.request("POST", path, { agentId: f.agentId })).toMatchObject({ status: 201, body: { id: delegated.body.id } });
    expect(await f.request("DELETE", `${path}/${delegated.body.id}`)).toMatchObject({ status: 200 });
    expect(await server.db.select().from(connectionGrantDelegations).where(eq(connectionGrantDelegations.grantId, grant.id))).toHaveLength(0);
    const events = await server.db.select().from(toolAccessAuditEvents).where(eq(toolAccessAuditEvents.connectionId, created.body.id));
    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "connection_grant.delegated", actorType: "agent", actorId: f.agentId }),
      expect.objectContaining({ action: "connection_grant.delegation_revoked", actorType: "agent", actorId: f.agentId }),
    ]));
    const activity = await server.db.select().from(activityLog).where(eq(activityLog.entityId, grant.id));
    expect(activity).toEqual(expect.arrayContaining([expect.objectContaining({ actorType: "agent", actorId: f.agentId, responsibleUserId: f.userId })]));
  });

  it("discovers and invokes connection APIs through default production native bindings", async () => {
    const f = await fixture();
    const definitions = await f.authority.definitions();
    const names = definitions.map(d => d.name);
    const context = await f.authority.execute({ tool: "get_task_context", callId: "configuration-guidance", arguments: {} });
    expect(JSON.stringify(context)).toContain("Standard agents can manage connections under their responsible user's authority");
    expect(JSON.stringify(definitions.find(d => d.name === "connections_search"))).toContain("search_api/call_api");
    expect(names).toEqual(expect.arrayContaining(["search_api", "call_api"]));
    const search = await f.authority.execute({ tool: "search_api", callId: "find-profile", arguments: { query: "create tools profiles", limit: 10 } });
    expect(JSON.stringify(search)).toContain("POST /api/companies/{companyId}/tools/profiles");
    const result = await f.authority.execute({ tool: "call_api", callId: "create-profile", arguments: { operationId: "POST /api/companies/{companyId}/tools/profiles", body: { profileKey: "native-profile", name: "Native profile", entries: [] } } });
    expect(result, JSON.stringify(result)).toMatchObject({ status: 201, ok: true });
  });

  it("persists meaningful Slack and GitHub endpoint configuration for the responsible user", async () => {
    const f = await fixture();
    for (const provider of ["slack", "github"]) {
      const result = await f.request("POST", `/companies/${f.companyId}/chat-endpoints`, { provider, assignedAgentId: f.agentId, name: `${provider} fixture`, ...(provider === "slack" ? { slackSetupMethod: "manual" } : {}) });
      expect(result, JSON.stringify(result)).toMatchObject({ status: 201 });
      if (provider === "slack") {
        const patch = { requireAtMention: true, allowDirectMessages: false };
        const updated = await f.request("PATCH", `/chat-endpoints/${result.body.id}`, patch);
        expect(updated, JSON.stringify(updated)).toMatchObject({ status: 200, body: patch });
      } else {
        const current = await f.request("GET", `/chat-endpoints/${result.body.id}/github/configuration`);
        expect(current, JSON.stringify(current)).toMatchObject({ status: 200 });
        const body = { expectedRevision: current.body.revision, configuration: { ...current.body.configuration, memberAccess: "selected" } };
        const updated = await f.request("PUT", `/chat-endpoints/${result.body.id}/github/configuration`, body);
        expect(updated, JSON.stringify(updated)).toMatchObject({ status: 200, body: { revision: 1, configuration: { memberAccess: "selected" } } });
        expect(await f.request("PUT", `/chat-endpoints/${result.body.id}/github/configuration`, body)).toMatchObject({ status: 409 });
        const handoff = await f.request("POST", `/chat-endpoints/${result.body.id}/github/identity/start`, {});
        expect(handoff).toMatchObject({ status: 200, body: { requiredUserAction: { userId: f.userId, resource: { id: result.body.id } } } });
      }
      expect((await f.request("GET", `/chat-endpoints/${result.body.id}`)).body.sponsorUserId).toBe(f.userId);
    }
  });

  it("configures Slack against provider fixtures and subjects test messages to the normal action policy", async () => {
    const f = await fixture();
    const botId = `U${f.agentId.replaceAll("-", "").toUpperCase()}`;
    const scopes = [...SLACK_CHAT_BOT_SCOPES, ...SLACK_BOT_TOOL_SCOPES];
    let sent = 0;
    provider = async (url, init) => {
      if (url.endsWith("auth.test")) return Response.json({ ok: true, team_id: "TFIXTURE", team: "Fixture workspace", user_id: botId, user: "fixture-bot" }, { headers: { "x-oauth-scopes": scopes.join(",") } });
      if (url.includes("conversations.list")) return Response.json({ ok: true, channels: [], response_metadata: { next_cursor: "" } });
      if (url.endsWith("users.info")) return Response.json({ ok: true, user: { id: "UHUMAN", team_id: "TFIXTURE", name: "Fixture user", is_bot: false, deleted: false } });
      if (url.endsWith("chat.postMessage")) { sent++; return Response.json({ ok: true, channel: "DTEST", ts: "1.000001" }); }
      if (url.endsWith("agents.sessions.setStatus")) return Response.json({ ok: true });
      throw new Error(`Unexpected Slack fixture operation: ${new URL(url).pathname}`);
    };
    try {
      const created = await f.request("POST", `/companies/${f.companyId}/chat-endpoints`, { provider: "slack", assignedAgentId: f.agentId, slackSetupMethod: "manual" });
      const configured = await f.request("POST", `/chat-endpoints/${created.body.id}/setup`, { action: "configure", credentials: { botToken: "xoxb-fixture-token", signingSecret: "fixture-signing-secret" } });
      expect(configured, JSON.stringify(configured)).toMatchObject({ status: 200 });
      expect(JSON.stringify(configured.body)).not.toContain("xoxb-fixture-token");
      // Identity is a provider fixture; production HTTP admission and policy remain real.
      const [principal] = await server.db.insert(chatExternalPrincipals).values({ companyId: f.companyId, provider: "slack", providerAccountId: "TFIXTURE", externalId: "UHUMAN", isBot: false }).returning();
      await server.db.insert(chatIdentityLinks).values({ companyId: f.companyId, endpointId: created.body.id, principalId: principal.id, paperclipUserId: f.userId, status: "linked", confirmedAt: new Date() });
      await server.db.update(chatEndpoints).set({ status: "active", allowDirectMessages: true }).where(eq(chatEndpoints.id, created.body.id));
      const [deny] = await server.db.insert(toolPolicies).values({ companyId: f.companyId, name: "Test messages off", policyType: "block", selectors: { connectionId: created.body.connectionId }, priority: 1 }).returning();
      const testPath = `/chat-endpoints/${created.body.id}/slack/test-message`;
      const denied = await f.request("POST", testPath, { requestId: randomUUID() });
      expect(denied, JSON.stringify(denied)).toMatchObject({ status: 403 });
      expect(sent).toBe(0);
      await server.db.update(toolPolicies).set({ policyType: "allow" }).where(eq(toolPolicies.id, deny.id));
      const requestId = randomUUID();
      const tested = await f.request("POST", testPath, { requestId });
      expect(tested, JSON.stringify(tested)).toMatchObject({ status: 200, body: { status: "sent" } });
      expect(await f.request("POST", testPath, { requestId })).toMatchObject({ status: 200 });
      expect(sent).toBe(1);
    } finally { provider = null; }
  });

  it("imports a GitHub App and discovers repositories against provider fixtures", async () => {
    const f = await fixture();
    const permissions = { contents: "read", issues: "write", metadata: "read", pull_requests: "write" };
    const appId = 100000 + Number.parseInt(f.agentId.slice(0, 6), 16);
    const privateKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    provider = async (url, init) => {
      const path = new URL(url).pathname;
      if (path === "/login/oauth/access_token") return Response.json({ access_token: "fixture-personal-token" });
      if (path === "/user") return Response.json({ id: 1357, login: "fixture-person" });
      if (path === "/user/installations") return Response.json({ installations: [{ id: 2468, app_id: appId }] });
      if (path === "/app") return Response.json({ id: appId, slug: `fixture-${f.agentId.slice(0, 8)}`, name: "Fixture App", owner: { login: "fixture" }, permissions,
        events: ["pull_request", "github_app_authorization", "installation", "installation_repositories", "issue_comment", "pull_request_review_comment"] });
      if (path === "/app/hook/config") return Response.json(init?.body ? JSON.parse(String(init.body)) : { url: "https://paperclip.fixture.invalid", content_type: "json", insecure_ssl: "0" });
      if (path === "/app/installations") return Response.json([{ id: 2468, account: { id: 1357, login: "fixture", type: "Organization" }, permissions, suspended_at: null }]);
      if (path === "/app/installations/2468") return Response.json({ permissions, suspended_at: null });
      if (path === "/app/installations/2468/access_tokens") return Response.json({ token: "fixture-installation-token" }, { status: 201 });
      if (path === "/installation/repositories") return Response.json({ repositories: [{ id: 42, name: "repo", full_name: "fixture/repo", private: true, owner: { login: "fixture" }, html_url: "https://github.com/fixture/repo" }] });
      throw new Error(`Unexpected GitHub fixture operation: ${path}`);
    };
    try {
      const created = await f.request("POST", `/companies/${f.companyId}/chat-endpoints`, { provider: "github", assignedAgentId: f.agentId });
      expect(await f.request("POST", `/chat-endpoints/${created.body.id}/github/registration`, { name: `fixture-${f.agentId.slice(0, 8)}` })).toMatchObject({ status: 200 });
      const imported = await f.request("POST", `/chat-endpoints/${created.body.id}/github/app`, { appId: String(appId), privateKey, webhookSecret: "fixture-webhook-secret", clientId: "fixture-client", clientSecret: "fixture-secret" });
      expect(imported, JSON.stringify(imported)).toMatchObject({ status: 200 });
      expect(JSON.stringify(imported.body)).not.toContain("PRIVATE KEY");
      const refreshed = await f.request("POST", `/chat-endpoints/${created.body.id}/github/repositories/refresh`, {});
      expect(refreshed, JSON.stringify(refreshed)).toMatchObject({ status: 200 });
      expect(JSON.stringify(refreshed.body)).toContain("fixture/repo");
      expect(await f.request("POST", `/chat-endpoints/${created.body.id}/github/verify`, {})).toMatchObject({ status: 200 });
      const cookie = await server.humanSession(f.userId);
      const humanRequest = (path: string, method = "GET", body?: unknown, session = cookie) => fetch(server.apiUrl + path, {
        method, redirect: "manual", headers: { cookie: session, "Content-Type": "application/json", origin: server.apiUrl },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const start = await humanRequest(`/api/chat-endpoints/${created.body.id}/github/identity/start`, "POST", {});
      const started = await start.json();
      expect(started, JSON.stringify(started)).toHaveProperty("authorizationUrl");
      const state = new URL(started.authorizationUrl).searchParams.get("state")!;
      const callback = `/api/chat-github/identity/callback?state=${encodeURIComponent(state)}&code=fixture-code`;
      const other = await fixture();
      const otherCookie = await server.humanSession(other.userId);
      expect((await humanRequest(callback, "GET", undefined, otherCookie)).status).toBe(403);
      expect((await humanRequest(callback)).status).toBe(303);
      expect((await humanRequest(callback)).status).toBe(403);
      const confirmed = await humanRequest(`/api/chat-endpoints/${created.body.id}/github/identity/confirm`, "POST", { githubUserId: "1357" });
      expect(confirmed.status, JSON.stringify(await confirmed.json())).toBe(200);
    } finally { provider = null; }
  });

  it("creates an email account through the API without exposing its write-only credential and reuses retries", async () => {
    const f = await fixture();
    provider = async url => {
      if (new URL(url).pathname === "/v0/auth/me") return Response.json({ scope_type: "organization", organization_id: "fixture-org" });
      throw new Error(`Unexpected AgentMail fixture operation: ${new URL(url).pathname}`);
    };
    try {
      const body = { apiKey: "fixture-agentmail-secret", grantKind: "user", agentIds: [f.agentId], allAgents: false, idempotencyKey: randomUUID() };
      const created = await f.request("POST", `/companies/${f.companyId}/email/connections`, body);
      expect(created, JSON.stringify(created)).toMatchObject({ status: 201 });
      expect(JSON.stringify(created.body)).not.toContain(body.apiKey);
      expect(await f.request("POST", `/companies/${f.companyId}/email/connections`, body)).toMatchObject({ status: 201, body: { id: created.body.id } });
      expect((await f.request("GET", `/companies/${f.companyId}/email/connections`)).body).toEqual(expect.arrayContaining([expect.objectContaining({ id: created.body.id })]));
      const [saved] = await server.db.select().from(toolConnections).where(eq(toolConnections.id, created.body.id));
      expect(saved.createdByUserId).toBe(f.userId);
    } finally { provider = null; }
  });

  it("keeps durable gateway client tokens bound to the issuer and responsible user", async () => {
    const f = await fixture();
    const profile = await f.request("POST", `/companies/${f.companyId}/tools/profiles`, { profileKey: "gateway-profile", name: "Gateway profile", entries: [] });
    expect(profile, JSON.stringify(profile)).toMatchObject({ status: 201 });
    const gateway = await f.request("POST", `/companies/${f.companyId}/tools/gateways`, { name: "Delegated gateway", slug: "delegated", profileId: profile.body.id });
    expect(gateway, JSON.stringify(gateway)).toMatchObject({ status: 201 });
    const call = { tool: "call_api", callId: "gateway-client-secret", arguments: {
      operationId: "POST /api/tool-gateway/gateways/{gatewayId}/tokens", pathParams: { gatewayId: gateway.body.id },
      body: { companyId: f.companyId, name: "Fixture client", clientLabel: "fixture", expiresAt: new Date(Date.now() + 3600000).toISOString() },
    } };
    const issued = await f.authority.execute(call) as { status: number; data: { id: string; token: string } };
    expect(issued, JSON.stringify(issued)).toMatchObject({ status: 201, data: { token: expect.any(String), responsibleUserId: f.userId } });
    expect(await f.authority.execute(call)).toEqual(issued);
    const token = { status: issued.status, body: issued.data };
    const [receiptRun] = await server.db.select().from(heartbeatRuns).where(eq(heartbeatRuns.id, f.runId));
    expect(JSON.stringify(receiptRun.resultJson)).not.toContain(token.body.token);
    const receipts = (receiptRun.resultJson as { apiToolReceipts: Record<string, { operationId: string }> }).apiToolReceipts;
    expect(Object.values(receipts).find(receipt => receipt.operationId === call.arguments.operationId)).toHaveProperty("encryptedResult");
    expect(JSON.stringify(redactRunnerApiPayloads(issued))).not.toContain(token.body.token);
    expect(await server.db.select().from(toolMcpGatewayTokens).where(eq(toolMcpGatewayTokens.gatewayId, gateway.body.id))).toHaveLength(1);
    const [saved] = await server.db.select().from(toolMcpGatewayTokens).where(eq(toolMcpGatewayTokens.id, token.body.id));
    expect(saved).toMatchObject({ createdByAgentId: f.agentId, responsibleUserId: f.userId, subjectType: "gateway_client" });
    const use = () => f.request("POST", `/mcp/gateways/${gateway.body.gatewayPublicId}`, { jsonrpc: "2.0", id: 1, method: "tools/list" }, token.body.token);
    expect(await use()).toMatchObject({ status: 200 });
    await server.db.update(principalPermissionGrants).set({ scope: { purpose: "tool" } }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_connections")));
    expect(await use()).toMatchObject({ status: 200 });
    await server.db.update(heartbeatRuns).set({ status: "succeeded" }).where(eq(heartbeatRuns.id, f.runId));
    expect(await use()).toMatchObject({ status: 200 });
    await server.db.update(companyMemberships).set({ status: "suspended" }).where(and(eq(companyMemberships.companyId, f.companyId), eq(companyMemberships.principalId, f.userId)));
    expect((await use()).status).toBeGreaterThanOrEqual(400);
    await server.db.update(companyMemberships).set({ status: "active" }).where(and(eq(companyMemberships.companyId, f.companyId), eq(companyMemberships.principalId, f.userId)));
    expect(await use()).toMatchObject({ status: 200 });
    await server.db.delete(principalPermissionGrants).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_connections")));
    expect((await use()).status).toBeGreaterThanOrEqual(400);
    // Model the token FK's ON DELETE SET NULL state without deleting the
    // fixture's protected historical activity references to the agent.
    await server.db.update(toolMcpGatewayTokens).set({ createdByAgentId: null }).where(eq(toolMcpGatewayTokens.id, token.body.id));
    const [orphaned] = await server.db.select().from(toolMcpGatewayTokens).where(eq(toolMcpGatewayTokens.id, token.body.id));
    expect(orphaned).toMatchObject({ createdByAgentId: null, responsibleUserId: f.userId });
    expect((await use()).status).toBeGreaterThanOrEqual(400);
  });

  it("requires retained profile authority to clear gateway bindings and connection audiences", async () => {
    const f = await fixture();
    const profile = await f.request("POST", `/companies/${f.companyId}/tools/profiles`, { profileKey: "bound-profile", name: "Bound profile", entries: [] });
    expect(profile, JSON.stringify(profile)).toMatchObject({ status: 201 });
    const gateway = await f.request("POST", `/companies/${f.companyId}/tools/gateways`, { name: "Bound gateway", slug: "bound", profileId: profile.body.id, agentId: f.agentId });
    expect(gateway, JSON.stringify(gateway)).toMatchObject({ status: 201, body: { agentId: f.agentId } });
    await server.db.delete(principalPermissionGrants).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_profiles")));
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, agentId: null })).toMatchObject({ status: 403 });
    expect(await f.request("GET", `/companies/${f.companyId}/tools/gateways`)).toMatchObject({ status: 200, body: { gateways: expect.arrayContaining([expect.objectContaining({ id: gateway.body.id, agentId: f.agentId })]) } });
    for (const audience of [{ allAgents: false }, { agentIds: [] }]) {
      expect(await f.request("POST", `/companies/${f.companyId}/ai-connections`, {
        provider: "openai", method: "api_key", name: "No audience authority", apiKey: "unused-fixture-secret", ...audience,
      })).toMatchObject({ status: 403 });
    }
  });

  it("requires access to saved and replacement gateway profiles and project bindings", async () => {
    const f = await fixture();
    const saved = await f.request("POST", `/companies/${f.companyId}/tools/profiles`, { profileKey: "saved-scope", name: "Saved scope", entries: [] });
    const replacement = await f.request("POST", `/companies/${f.companyId}/tools/profiles`, { profileKey: "replacement-scope", name: "Replacement scope", entries: [] });
    expect(saved.status).toBe(201);
    expect(replacement.status).toBe(201);
    expect(await f.request("POST", `/companies/${f.companyId}/tools/profiles/${saved.body.id}/bind`, { targetType: "project", targetId: f.projectId })).toMatchObject({ status: 201 });
    const gateway = await f.request("POST", `/companies/${f.companyId}/tools/gateways`, { name: "Scoped gateway", slug: "scoped", profileId: saved.body.id });
    expect(gateway.status).toBe(201);
    await server.db.update(principalPermissionGrants).set({ scope: { profileIds: [replacement.body.id] } }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_connections")));
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, profileId: replacement.body.id })).toMatchObject({ status: 403 });
    // A grant covering both sides permits the same requested change.
    await server.db.update(principalPermissionGrants).set({ scope: { profileIds: [saved.body.id, replacement.body.id] } }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_connections")));
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, profileId: replacement.body.id })).toMatchObject({ status: 200, body: { profileId: replacement.body.id } });
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, projectId: f.projectId })).toMatchObject({ status: 200 });
    const nextProjectId = randomUUID();
    await server.db.insert(projects).values({ id: nextProjectId, companyId: f.companyId, name: "Replacement project" });
    await server.db.update(principalPermissionGrants).set({ scope: { projectIds: [f.projectId] } }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_profiles")));
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, projectId: nextProjectId })).toMatchObject({ status: 403 });
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, projectId: null })).toMatchObject({ status: 403 });
    await server.db.update(principalPermissionGrants).set({ scope: { projectIds: [f.projectId, nextProjectId] } }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_profiles")));
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, projectId: nextProjectId })).toMatchObject({ status: 200, body: { projectId: nextProjectId } });
    await server.db.update(principalPermissionGrants).set({ scope: null }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_profiles")));
    expect(await f.request("PATCH", `/tool-gateway/gateways/${gateway.body.id}`, { companyId: f.companyId, projectId: null })).toMatchObject({ status: 200, body: { projectId: null } });
  });

  it("saves an AI account with fixture verification under the user's ownership and agent attribution", async () => {
    const f = await fixture();
    provider = async url => {
      if (url === "https://api.openai.com/v1/models") return Response.json({ data: [] });
      throw new Error("Unexpected AI fixture request");
    };
    try {
      const account = await f.request("POST", `/companies/${f.companyId}/ai-connections`, { provider: "openai", method: "api_key", name: "Fixture OpenAI", ownership: "personal", apiKey: "fixture-secret-do-not-return", agentIds: [f.agentId] });
      expect(account, JSON.stringify(account)).toMatchObject({ status: 201 });
      expect(JSON.stringify(account)).not.toContain("fixture-secret-do-not-return");
      const list = await f.request("GET", `/companies/${f.companyId}/ai-connections`);
      expect(list).toMatchObject({ status: 200, body: { currentUserId: f.userId } });
      const [row] = await server.db.select().from(toolConnections).where(eq(toolConnections.id, account.body.connectionId));
      expect(row.createdByUserId).toBe(f.userId);
      const binding = { mode: "delegated", provider: "openai", method: "api_key", ...account.body };
      const bound = await f.request("PATCH", `/agents/${f.agentId}`, { runtimeConfig: { heartbeat: { enabled: false, wakeOnDemand: false }, aiConnection: binding } });
      expect(bound, JSON.stringify(bound)).toMatchObject({ status: 200 });
      await instanceSettingsService(server.db).updateExperimental({ enableAiConnectionRouters: true });
      const pluginKey = `fixture.router.${f.agentId}`;
      await server.db.insert(plugins).values({ pluginKey, packageName: pluginKey, version: "0.1.0", status: "ready", manifestJson: {
        id: pluginKey, apiVersion: 1, version: "0.1.0", displayName: "Fixture router", description: "Fixture", author: "Tests",
        categories: ["connector"], capabilities: ["ai.connections.route"], aiConnectionRouter: { name: "Fixture pool", description: "Use saved accounts" }, entrypoints: { worker: "worker.js" },
      } });
      const config = { name: "Fixture pool", enabled: true, mode: "round_robin", thresholdPercent: 90,
        members: [{ id: randomUUID(), binding, profile: { provider: "codex", model: "gpt-5.6-sol", effort: "low" } }] };
      const pool = await f.request("POST", `/companies/${f.companyId}/ai-connection-pools`, { pluginKey, config });
      expect(pool, JSON.stringify(pool)).toMatchObject({ status: 200, body: { revision: 1 } });
      const changed = await f.request("POST", `/companies/${f.companyId}/ai-connection-pools`, { pluginKey, id: pool.body.id, expectedRevision: 1, config: { ...config, name: "Changed pool" } });
      expect(changed, JSON.stringify(changed)).toMatchObject({ status: 200, body: { revision: 2 } });
      expect(await f.request("DELETE", `/companies/${f.companyId}/ai-connection-pools/${pool.body.id}`, { expectedRevision: 1 })).toMatchObject({ status: 409 });
      expect(await f.request("DELETE", `/companies/${f.companyId}/ai-connection-pools/${pool.body.id}`, { expectedRevision: 2 })).toMatchObject({ status: 200 });
      await server.db.delete(principalPermissionGrants).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_profiles")));
      expect(await f.request("POST", `/companies/${f.companyId}/ai-connections`, { provider: "openai", method: "api_key", name: "No sharing authority", ownership: "personal", apiKey: "fixture-secret", agentIds: [f.agentId] })).toMatchObject({ status: 403 });
    } finally { provider = null; }
  });

  it("reuses a saved chat authentication request and resumes only while its authority remains valid", async () => {
    const f = await fixture();
    const created = await f.request("POST", `/companies/${f.companyId}/chat-endpoints`, { provider: "github", assignedAgentId: f.agentId });
    expect(created.status).toBe(201);
    const path = `/chat-endpoints/${created.body.id}/github/identity/start`;
    const first = await f.request("POST", path, {}, f.jwt);
    expect(first, JSON.stringify(first)).toMatchObject({ status: 200, body: { interactionId: expect.any(String) } });
    const retry = await f.request("POST", path, {}, f.jwt);
    expect(retry.body.interactionId).toBe(first.body.interactionId);
    const [intent] = await server.db.select().from(issueThreadInteractions).where(eq(issueThreadInteractions.id, first.body.interactionId));
    const [task] = await server.db.select().from(issues).where(eq(issues.id, f.issueId));
    expect(intent).toMatchObject({ addresseeUserId: f.userId, payload: { savedSetup: { endpointId: created.body.id, connectionId: created.body.connectionId } } });
    expect(await findSatisfiedToolConnection(server.db, task, intent)).toBeNull();
    // Provider fixture marks the exact saved endpoint authenticated, after the run yields.
    await server.db.update(heartbeatRuns).set({ status: "succeeded" }).where(eq(heartbeatRuns.id, f.runId));
    await server.db.update(chatEndpoints).set({ status: "active" }).where(eq(chatEndpoints.id, created.body.id));
    await server.db.update(toolConnections).set({ status: "active", enabled: true, healthStatus: "healthy" }).where(eq(toolConnections.id, created.body.connectionId));
    expect((await findSatisfiedToolConnection(server.db, task, intent))?.id).toBe(created.body.connectionId);
    expect(await findSatisfiedToolConnection(server.db, { ...task, status: "cancelled" }, intent)).toBeNull();
    await accessService(server.db).ensureMembership(f.companyId, "user", f.userId, "operator", "suspended");
    expect(await findSatisfiedToolConnection(server.db, task, intent)).toBeNull();
    await accessService(server.db).ensureMembership(f.companyId, "user", f.userId, "operator", "active");
    await satisfiedConnectionIntentService(server.db).sweepPending();
    const [delivery] = await server.db.select().from(connectionIntentDeliveries).where(eq(connectionIntentDeliveries.interactionId, intent.id));
    expect(delivery).toBeDefined();
  });

  it("retains a restricted user's personal self-service without company management or spoofed ownership", async () => {
    const f = await fixture();
    await server.db.delete(principalPermissionGrants).where(and(eq(principalPermissionGrants.principalType, "user"), eq(principalPermissionGrants.principalId, f.userId)));
    provider = async url => {
      if (url === "https://api.openai.com/v1/models") return Response.json({ data: [] });
      throw new Error("Unexpected AI fixture request");
    };
    const payload = { provider: "openai", method: "api_key", name: "Personal", ownership: "personal", apiKey: "personal-fixture", agentIds: [], allAgents: false };
    try {
      expect(await f.request("POST", `/companies/${f.companyId}/ai-connections`, { ...payload, ownership: "shared" })).toMatchObject({ status: 403 });
      expect(await f.request("POST", `/companies/${f.companyId}/ai-connections`, { ...payload, responsibleUserId: randomUUID() })).toMatchObject({ status: 403 });
      expect(await f.request("POST", `/companies/${f.companyId}/ai-connections`, payload)).toMatchObject({ status: 201 });
    } finally { provider = null; }
  });

  it("rejects foreign personal metadata, missing responsible users and task-bridge keys", async () => {
    const f = await fixture();
    const created = await f.request("POST", `/companies/${f.companyId}/tools/connections`, { name: "Foreign personal fixture", transport: "mcp_remote", authKind: "none", transportConfig: { url: "https://1.1.1.1/mcp" } });
    expect(created.status).toBe(201);
    await server.db.update(toolConnections).set({ credentialPolicy: "per_user", createdByUserId: randomUUID() }).where(eq(toolConnections.id, created.body.id));
    expect(await f.request("GET", `/tool-connections/${created.body.id}`)).toMatchObject({ status: 403 });
    const listed = await f.request("GET", `/companies/${f.companyId}/tools/connections`);
    expect(JSON.stringify(listed.body)).not.toContain("Foreign personal fixture");
    const [policy] = await server.db.insert(toolPolicies).values({ companyId: f.companyId, name: "Private account rule", policyType: "block", selectors: { connectionIds: [created.body.id] } }).returning();
    expect(JSON.stringify((await f.request("GET", `/companies/${f.companyId}/tools/policies`)).body)).not.toContain(policy.id);
    expect(await f.request("POST", `/companies/${f.companyId}/tools/policies`, { name: "Cannot edit foreign access", policyType: "allow", selectors: { agentId: f.agentId, connectionIds: [created.body.id] } })).toMatchObject({ status: 403 });

    await server.db.update(agentApiKeys).set({ responsibleUserId: null }).where(eq(agentApiKeys.id, f.key.id));
    expect((await f.request("GET", `/companies/${f.companyId}/tools/gallery`)).status).toBeGreaterThanOrEqual(400);
    const g = await fixture();
    await server.db.update(agentApiKeys).set({ scopeConfig: { kind: "task_bridge", issueId: g.issueId } }).where(eq(agentApiKeys.id, g.key.id));
    expect((await g.request("GET", `/companies/${g.companyId}/tools/gallery`)).status).toBeGreaterThanOrEqual(400);
  });

  it("revalidates pending credential promotion after yielding without reviving cancelled work", async () => {
    const f = await fixture();
    const context = await connectionManagementService(server.db).authorize({ type: "agent", companyId: f.companyId,
      agentId: f.agentId, runId: f.runId, onBehalfOfUserId: f.userId }, "connections:configure",
      { type: "connection_management", companyId: f.companyId, purpose: "ai", operation: "login" });
    const continuation = continuingConnectionManagement(context)!;
    await server.db.update(heartbeatRuns).set({ status: "succeeded" }).where(eq(heartbeatRuns.id, f.runId));
    await expect(context.reauthorize()).rejects.toThrow();
    await expect(continuation.reauthorize()).resolves.toBeUndefined();
    await server.db.update(issues).set({ status: "cancelled" }).where(eq(issues.id, f.issueId));
    await expect(continuation.reauthorize()).rejects.toThrow();
  });

  it("denies revoked agent grants and user authority, including shadow mode, without backfilling", async () => {
    const f = await fixture();
    await server.db.delete(principalPermissionGrants).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_connections")));
    expect(await f.request("GET", `/companies/${f.companyId}/tools/gallery`)).toMatchObject({ status: 403 });
    const g = await fixture();
    await accessService(server.db).ensureMembership(g.companyId, "user", g.userId, "operator", "suspended");
    expect(await g.request("GET", `/companies/${g.companyId}/tools/gallery`)).toMatchObject({ status: 403 });
  });

  it("enforces grant scopes, company isolation, effective trust, and Ask/Plan work modes", async () => {
    const f = await fixture();
    expect(await f.request("GET", `/companies/${f.foreignCompanyId}/tools/gallery`)).toMatchObject({ status: 403 });
    const owned = await f.request("POST", `/companies/${f.companyId}/tools/connections`, { name: "Scoped fixture", transport: "mcp_remote", authKind: "none", transportConfig: { url: "https://1.1.1.1/mcp" } });
    expect(owned.status).toBe(201);
    await server.db.update(principalPermissionGrants).set({ scope: { connectionIds: [owned.body.id], purposes: ["tool"], operations: ["GET /tool-connections/:connectionId"] } }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_connections")));
    expect(await f.request("GET", `/tool-connections/${owned.body.id}`)).toMatchObject({ status: 200 });
    expect(await f.request("PATCH", `/tool-connections/${owned.body.id}`, { name: "Beyond operation scope" })).toMatchObject({ status: 403 });
    await server.db.update(principalPermissionGrants).set({ scope: { provider: "slack" } }).where(and(eq(principalPermissionGrants.principalId, f.agentId), eq(principalPermissionGrants.permissionKey, "tools:manage_connections")));
    expect(await f.request("POST", `/companies/${f.companyId}/chat-endpoints`, { provider: "github", assignedAgentId: f.agentId })).toMatchObject({ status: 403 });
    const g = await fixture();
    for (const workMode of ["ask", "planning", "skill_test"]) {
      await server.db.update(issues).set({ workMode }).where(eq(issues.id, g.issueId));
      expect(await g.request("POST", `/companies/${g.companyId}/tools/profiles`, { name: "Forbidden" }, g.jwt)).toMatchObject({ status: 403 });
    }
    await server.db.update(issues).set({ workMode: "standard" }).where(eq(issues.id, g.issueId));
    await server.db.update(projects).set({ executionWorkspacePolicy: { authorizationPolicy: { trustPreset: "low_trust_review", lowTrustBoundary: { projectIds: [g.projectId] } } } }).where(eq(projects.id, g.projectId));
    expect(await g.request("POST", `/companies/${g.companyId}/tools/profiles`, { name: "Forbidden trust" }, g.jwt)).toMatchObject({ status: 403 });
    await server.db.update(agents).set({ permissions: { trustPreset: "low_trust_review", authorizationPolicy: { trustBoundary: { mode: "low_trust_review", projectIds: [g.projectId], rootIssueId: g.issueId } } } }).where(eq(agents.id, g.agentId));
    expect(await g.request("POST", `/companies/${g.companyId}/tools/profiles`, { name: "Forbidden agent trust" })).toMatchObject({ status: 403 });
  });
});
