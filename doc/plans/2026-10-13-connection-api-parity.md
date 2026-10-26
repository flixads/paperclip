# Agent API parity for connection configuration

Dated 2026-10-13. Implementation and qualification record for the connection-management change based on `e43af9770a36ff92e14cf0e31ee16fa238310f76`.

## Outcome

A newly created standard agent can administer connections using its existing default grants and its responsible user's authority. The default Operator has the human permissions needed for these operations. API reachability includes app/tool connections, chat/email endpoints, GitHub and Slack setup, AI accounts and pools, profiles, named gateways and gateway clients. Human authentication and trusted-host operations retain their explicit boundaries.

No agent grant backfill is performed. An existing missing or scoped grant remains missing or scoped. An operator can explicitly change those grants through the existing permission-management surface. Agents do not acquire `tools:admin` by default and cannot edit their own principal permissions or approve their own governed requests.

## Authorization contract

`server/src/services/connection-management.ts` resolves authenticated management context and invokes the existing authorization evaluator. `server/src/routes/connection-management-authz.ts` resolves route resources and all referenced targets, then supplies that context to services. Capability reporting calls the same evaluator; every mutation checks authority again.

| Operation | Agent grant | Responsible-user ceiling |
| --- | --- | --- |
| Configure connections, channels and AI accounts | `tools:manage_connections` | Existing personal/creator authority or connection management |
| Profiles, assignments and action policies | `tools:manage_profiles` | Corresponding profile and target-agent authority; changes to connection audience also require connection management |
| Named gateways and client tokens | `tools:manage_connections` | `tools:admin`; bindings also require profile and target authority |
| Audit | `tools:view_audit` | Audit and resource visibility |
| Start/stop runtimes | `tools:manage_runtime` | Runtime and resource authority |
| Test actions | `tools:use` | Credential access, target-agent authority and ordinary tool/action policy |

The acting principal, responsible user, credential owner and target agent remain distinct. Personal credentials belong to the responsible human. Activity records identify the actual agent, responsible user, run or API key, resource and authorization reason. API parameters cannot select a responsible user or forge ownership attribution.

Agent keys resolve their saved responsible user. Run JWTs require current run identity and assignment. Both fail closed on absent user context, inactive membership, foreign companies, unavailable personal credentials, invalid scopes or low trust. Connection authorization enforces the human ceiling even when general responsible-user authorization runs in shadow mode. `skill_test` and `task_bridge` cannot administer connections. Ask and Plan contexts cannot mutate configuration. Connection/profile/gateway/provider/purpose/operation grant scopes apply to resolved resources, including plural policy selectors and affected targets.

Services recheck management context after asynchronous provider work before sensitive persistence. Existing revisions, transaction locks, credential leases, vault storage, duplicate prevention and cleanup stay authoritative. Reads filter private accounts, referenced profile/pool resources and task activity. Configuration authority is separate from use: an allowed policy change does not bypass Off/Ask first/Allowed execution policy.

Binding and audience authorization checks field presence, including `null`, `false` and empty arrays. Clearing an assignment or reducing an audience remains a profile-management operation after an explicit grant revocation. Gateway binding changes check both the saved and replacement profile/project/task contexts; reauthorization reloads the saved side after asynchronous work. Referenced resources require each applicable connection and profile permission, including the replacement side of a project binding.

## Saved authentication and delegation

Agent setup responses retain their browser fields and add `requiredUserAction` where a human step is needed. It identifies the addressed user, saved resource, setup destination, reason and continuation. Chat handoffs reuse the saved endpoint and existing connection-intent delivery. AI login handoffs reopen the saved sign-in intent in the existing credential UI. Completion is based on server state; the UI does not ask a human to certify setup success.

Generic app OAuth returns the saved setup destination without creating agent-bound provider state; the human browser starts the existing session-bound authorization flow. Its `expiresAt` is null until that human step creates an expiring provider session. Slack/GitHub provider callbacks preserve human subject and state checks. Agent-created GitHub setup binds its browser session when the addressed human opens it. Identity callbacks validate the current human and session before consuming state, and revalidate authority before saving identity. Wrong-user callbacks leave the rightful user's flow intact. Continuation rechecks task state and current authority after a yielding run; cancelled tasks and revoked access cannot be revived by a late provider result.

Agent-issued durable gateway clients store `responsible_user_id` alongside `created_by_agent_id`. Token use reevaluates issuer/user authority, gateway/profile scope, target constraints, credential access and action restrictions. The responsible-user marker remains after deletion clears the issuer foreign key, so an orphaned delegated token fails closed instead of becoming a system client. It does not inherit the lifetime of the setup run. Heartbeat tokens remain bound to their authenticated run. Legacy agent-issued clients without a responsible user fail closed; existing board-issued clients retain their behavior. Migration `0378_slim_nehzno.sql` is additive and does not infer legacy identity or modify agent grants.

## Discovery and guidance

OpenAPI carries explicit REST transport and connection-management authorization metadata. JSON authorization initiation and status are callable through default `search_api`/`call_api`; OAuth callbacks, redirects, MCP and WebSocket sessions retain their protocols. There is no new administration tool family.

The shared connection guidance is delivered by the runtime prompt, search tools and existing adapter/CLI consumers. It tells agents to distinguish tool/channel/AI purposes, configure what the user requested when authorized, suggest relevant missing connections, reuse saved drafts and hand off only missing decisions, credentials, consent or authority. It prohibits silently relaxing policy after failed execution and distinguishes saved, authenticated, usable and verified states. Native API setup secrets and gateway credentials use protected replay receipts and redacted history.

## Operation inventory

The existing maps are the checklist, not a second runtime registry:

| Inventory | Coverage |
| --- | --- |
| [Connection setup](../../maps/agent-access-map/connection-setup.md) | Catalog/method discovery, preflight, drafts, authentication, connection intents and host boundaries |
| [App permissions](../../maps/agent-access-map/app-permissions.md) | Account lifecycle, installations/grants, policy, catalog, action tests and activity |
| [Chat channels](../../maps/agent-access-map/chat-channels.md) | Endpoint/provider setup, settings, defaults, destination access, GitHub/Slack registration and identity, email, tests and lifecycle |
| [Gateways and profiles](../../maps/agent-access-map/gateways-profiles.md) | Profiles/bindings, gateway configuration, client tokens, runtime controls, protocol and audit |
| [Model accounts](../../maps/agent-access-map/runs-adapters.md#model-accounts) | AI discovery, key/login setup, reconnect/defaults, managed agent bindings, pools and lifecycle |

The route inventory was reconciled against the production `tools`, `chatEndpoints`, `email`, `ai-connections`, `ai-connection-pools` and relevant `agents` UI API clients. Human-only operations remain individually classified: browser callback/identity confirmation and credential entry, principal approvals, arbitrary local configuration import/host-template authoring, cloud instance enrollment, and manual chat publication/replay that does not run through the governed agent tool path. Approved template use and ordinary authorized remote configuration remain delegable. Catalog/provider availability gates still apply.

## Qualification

`server/src/__tests__/connection-management.integration.test.ts` runs the assembled server, production bearer authentication, real database/vault persistence and deterministic provider responses. It creates each standard agent with an actual human-authenticated `POST /companies/:companyId/agents`; it provisions the human using normal Operator role defaults. It adds no special agent grants and does not inject `req.actor`. Only fixture sign-in throttling is disabled. GitHub/Slack/OpenAI/AgentMail responses are fixtures, not live provider proof.

The suite exercises:

- Fresh default app connections, profiles, chat settings, AI account/binding/pool and named gateway/token creation; no default `tools:admin` grant.
- Actual persistent API keys and run JWTs, native discovery/calls, and delivery of the new built-in guidance.
- Correct human ownership and actual-agent audit attribution, including personal grant delegation and revocation; persisted settings and optimistic revision conflicts.
- Slack configured credentials and test messages under ordinary action policy; repeated request IDs do not resend.
- GitHub app import, repository/verification configuration and real-session identity handoff; wrong-user and replay rejection.
- Saved chat handoff reuse and existing task continuation; late credential promotion after yield, cancellation and user revocation.
- User restrictions with legitimate personal self-service, missing/scoped agent grants, foreign companies/accounts, forged identity, invalid responsible users, bridge keys, low trust and work-mode restrictions.
- Durable gateway use after the setup run finishes, purpose-scoped grants, denial after membership or issuer-grant revocation and in the persisted cleared-issuer state, encrypted native token receipts, redacted history and retry without a second token.

Focused neighboring tests cover existing human routes, callback behavior, provider setup, device/setup-token sign-in, native API policy, secret redaction, saved setup UI and connection-intent behavior. Maps distinguish individually executed fixture operations from source-reviewed operations. Scripted evidence proves reachability and behavior, not an empirical LLM success rate.

Required final checks are `node scripts/check-maps.mjs`, `pnpm -r typecheck`, `pnpm test:run`, `pnpm build`, database migration validation and UI token gates. The final handoff records their actual results. Live provider setup, a new chatbot skill and redesigned setup workflows are outside this delivery.

## Historical validation record (2026-10-13)

- Focused connection, AI hiring, native API and OpenAPI suites: **2,533 passed**, including **16 assembled-server acceptance scenarios** using production authentication and default agent creation.
- Final fresh-process connection qualification: **618 passed across five suites**, including **all 18 assembled-server acceptance scenarios**, 418 tool-access tests, 87 gateway acceptance tests, 73 authorization tests and 22 decision-model tests. This covers binding/audience revocation, both sides of profile/project scope changes, current membership authority and gateway-token ownership metadata.
- Chat compatibility regression selection: **49 passed** (Slack tests, resource auditing, manager boundaries and Teams activity/projections).
- Saved setup UI, canonical guidance and native history redaction: passed in the neighboring focused run; its three outdated API transport/security assertions were corrected and included in the 2,533-test passing run.
- `pnpm -r typecheck`: passed.
- `pnpm build`: passed.
- Database migration numbering/safety validation: passed through typecheck/build; existing historical safety findings remain covered by the repository baseline.
- `node scripts/check-maps.mjs`: passed, 35 areas / 176 capability IDs; structural consistency only.
- UI token gates: passed.
- Broad UI run: 8,210 passed / 5 failed under contention; both failing suites passed serially (82 tests).
- Shared contracts and catalog: 941 passed. Adapter utilities: 1,740 passed / 5 failed under contention; all five failing suites passed serially (217 tests).
- Remaining source-only adapter/plugin projects: 2,087 passed / 1 macOS temporary-path assertion failed; that suite passed with the repository runner’s canonical temporary directory (14 tests).
- Serialized route/auth suites without embedded PostgreSQL: 1,849 passed / 22 failures in two empty-database fixtures; after adding the resource/membership fixture rows, both suites passed (25 tests). Their authentication, isolation and provider-error assertions remain exercised.
- Email address/provider regression suite: 10 passed after supplying resource and membership rows to its old empty-database fixture. HTTP log redaction: 66 passed in a fresh process after a sweep timeout.
- CLI suites without embedded PostgreSQL: 462 passed across 63 files. The three database-backed suites produced 62 passes and three embedded-PostgreSQL initialization failures in `worktree.test.ts`. The host was at its 32/32 shared-memory segment limit; these worktree tests need additional concurrent clusters. Other chats' databases and system limits were not modified.
- Database package: 194 passed across 50 files.
- Database-backed serialized routes: 1,208 passed / two failed / 73 skipped. Seven suites hit their 20-second database startup limit; the failures were an outdated AI-pool role fixture and a routine test timeout. All affected suites passed fresh-process reruns.
- Final isolated gateway/service/route reruns: **320 passed across 13 suites**, including the startup failures, skill cleanup deadlock, AI-pool membership fixture and routine timeout. The stale-lock route suite initially skipped its 14 tests after a failed database availability probe; a final isolated retry executed and passed all 14.
- Final assembled-server acceptance after the gateway scope and orphaned-token fixes: **18 passed**. The orphaned-token case models the token foreign key's persisted `ON DELETE SET NULL` state without deleting protected historical audit references; token use still traverses the real public gateway endpoint.
- Final workspace typecheck/build, migration checks, maps, token gates and `git diff --check`: passed. The generated migration retains exactly the five newest schema snapshots.
- `pnpm test:run`: the general server sweep finished with 19,282 passed / 15 failed / 381 skipped across 914 files (898 passed, 10 failed, 6 skipped). Four suites could not start their databases; other failures included two gateway tests loaded against earlier transformed authorization code, outdated role/resource fixtures, a cleanup deadlock, an HTTP timeout and a socket hang-up. All reported server failures and blocked startup suites subsequently passed fresh reruns. Workspace and serialized groups were executed separately after the runner's fail-fast exit. The original sweep is not represented as a clean pass.

As of October 13, qualification was complete for the connection feature and its provider fixtures. The repository-wide test result at that time remained **not fully green** because the three CLI worktree tests could not initialize their additional PostgreSQL clusters at the host's shared-memory limit. They require rerunning on a host with spare PostgreSQL capacity. Live provider verification remains outside this delivery.

## PR qualification (2026-10-26)

The implementation was rebased onto `a1f77821b9cd5c9c846fdf7a0fa5cc620ad2b6bb`. Connection-service changes were ported into the current extracted modules. The historical checks above describe the October 13 snapshot; fresh PR qualification is recorded separately below.

- Fresh Node 24.22.1 / pnpm 9.15.4 workspace typecheck and build passed. Migration safety, module boundaries, and UI token gates passed.
- Initial embedded-database acceptance could not run: the first install lacked native library links; after package setup, a direct `initdb` reproduction reported the host semaphore limit (`semget`: No space left on device). No shared databases or kernel limits were changed. The broad local test attempt is not a clean pass.
- First Linux CI exposed a duplicate user fixture, a lost viewer restriction, a host-template visibility gap, an integration fixture race with production harness verification, and the prompt-bound Copilot identity. These are tracked and fixed separately from the local host limit. Current-head CI remains the completion gate.
- Harness verification uses a deterministic lifecycle driver fixture; agent creation, grant defaults, bearer authentication, authorization, and persistence remain production paths.

- Fresh isolated PostgreSQL 18 qualification: **31 acceptance scenarios passed** through the assembled server and actual bearer/session middleware. The database is a task-owned container; no shared service or kernel setting was changed. CI uses its normal embedded database path.
- Review regressions now prove nested finish audience authorization, both management grants, all/current target limits, task/project execution policy, actual actor/run attribution, another authorized target agent, human approval after a successfully yielded run, user/agent revocation, task cancellation, and replay without a second provider call.
- The local MCP fixture initially lacked cached healthy catalog state; the next fixture pass exposed equal policy-priority assumptions and a legitimate closed-task 409. Those fixture expectations were corrected. A reused external test database also caused a Slack identity collision; the passing run used a fresh database. None of those attempts is represented as a passing run.
- Saved setup UI and shared guidance: **278 passed**. Native API/OpenAPI regression selection: **2,041 passed**. Prompt-bound Copilot identity: **57 passed**.

- Further review regressions cover bounded selector expansion before resource reads, duplicate-selector lookup cost, foreign-resource non-disclosure, one run capture per management listing, provider scope on existing and proposed configuration, and grant revocation during remote endpoint validation before persistence. Commit-time checks resolve current saved selectors and affected targets again.
- A one-call rate limit permits the admitted test and denies the next test without a second provider invocation. The final policy check carries the invocation's recorded admission. The first new test assertion used an incorrect response shape; the corrected assertion checks the existing `decision`/`error` contract and actual provider call count.
- Current workspace typecheck and production build passed after these changes. The focused Slack retry authorization cases passed (**3 tests**) after sorting both ID reads. Their first local attempt raced the database package build's migration-directory replacement; after that build completed, normal migrations and all three cases passed.
- The preceding CI head had several runner-shutdown cancellations and a browser strict-locator failure involving duplicate chat replies. The chat integration failure was an unordered ID comparison, corrected above. These failures remain part of the qualification history; only fresh current-head CI can establish the final check result.
