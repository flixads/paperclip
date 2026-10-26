# External chat and email conversations — agent access

Product map: [chat-channels](../feature-map/chat-channels.md).

Feature ID: `chat-channels`.

Review date: 2026-10-26. Source base: `a1f77821b9cd5c9c846fdf7a0fa5cc620ad2b6bb`; implementation: [#17737](https://github.com/paperclipai/paperclip/pull/17737).

Connection operations reviewed in this working tree. The inventory was reconciled
against production UI clients, REST registrations and service entry points; it is
a review checklist, not a runtime registry. [Authorization and evidence contract](../../doc/plans/2026-10-13-connection-api-parity.md).
Fixture evidence is separate from live provider qualification and from empirical
LLM success. Source-only entries have a reviewed agent path or an explicit boundary,
but do not claim an individually executed HTTP test.

## `providers`

Capability ID: `chat-channels/providers`.

Review: `operation-reviewed`.

### `get-companies-chat-endpoints`

API: `present` — `GET /api/companies/{companyId}/chat-endpoints`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-companies-chat-endpoints`

API: `present` — `POST /api/companies/{companyId}/chat-endpoints`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `get-chat-endpoints`

API: `present` — `GET /api/chat-endpoints/{endpointId}`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `get-companies-chat-slack-setup-options`

API: `present` — `GET /api/companies/{companyId}/chat-slack/setup-options`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-slack-managed-authorize`

API: `present` — `POST /api/chat-endpoints/{endpointId}/slack/managed/authorize`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-slack-managed-provision`

API: `present` — `POST /api/chat-endpoints/{endpointId}/slack/managed/provision`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `delete-companies-chat-slack-manager-grants`

API: `present` — `DELETE /api/companies/{companyId}/chat-slack/manager-grants/{grantId}`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-slack-managed-oauth-callback`

API: `present` — `GET /api/chat-slack/managed/oauth/callback`; browser/provider/MCP protocol.
Agent access: `restricted` — browser authentication return.
Policy: Provider state/signature or gateway-token verification, company and resource binding; browser returns require the configuring human. Agent-issued durable gateway tokens retain both issuer and responsible-user authority.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `post-chat-endpoints-slack-registration`

API: `present` — `POST /api/chat-endpoints/{endpointId}/slack/registration`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-slack-install`

API: `present` — `POST /api/chat-endpoints/{endpointId}/slack/install`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-slack-oauth-callback`

API: `present` — `GET /api/chat-slack/oauth/callback`; browser/provider/MCP protocol.
Agent access: `restricted` — browser authentication return.
Policy: Provider state/signature or gateway-token verification, company and resource binding; browser returns require the configuring human. Agent-issued durable gateway tokens retain both issuer and responsible-user authority.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `get-chat-endpoints-github-configuration`

API: `present` — `GET /api/chat-endpoints/{endpointId}/github/configuration`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `put-chat-endpoints-github-configuration`

API: `present` — `PUT /api/chat-endpoints/{endpointId}/github/configuration`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-chat-endpoints-github-verify`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/verify`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `put-chat-endpoints-github-progress`

API: `present` — `PUT /api/chat-endpoints/{endpointId}/github/progress`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-endpoints-github-personal-connections`

API: `present` — `GET /api/chat-endpoints/{endpointId}/github/personal-connections`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-github-people-lookup`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/people/lookup`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-github-registration`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/registration`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-chat-endpoints-github-registration-restart`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/registration/restart`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `put-chat-endpoints-github-draft`

API: `present` — `PUT /api/chat-endpoints/{endpointId}/github/draft`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-github-setup`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/setup`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-github-app`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/app`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-chat-endpoints-github-repositories-refresh`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/repositories/refresh`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `get-chat-endpoints-github-repositories`

API: `present` — `GET /api/chat-endpoints/{endpointId}/github/repositories`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `put-chat-endpoints-github-repositories-access`

API: `present` — `PUT /api/chat-endpoints/{endpointId}/github/repositories/access`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `patch-chat-endpoints`

API: `present` — `PATCH /api/chat-endpoints/{endpointId}`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-chat-endpoints-photon-inspect`

API: `present` — `POST /api/chat-endpoints/{endpointId}/photon/inspect`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-setup`

API: `present` — `POST /api/chat-endpoints/{endpointId}/setup`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-chat-endpoints-setup-secret`

API: `present` — `POST /api/chat-endpoints/{endpointId}/setup-secret`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-endpoints-resources`

API: `present` — `GET /api/chat-endpoints/{endpointId}/resources`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `put-chat-endpoints-resources`

API: `present` — `PUT /api/chat-endpoints/{endpointId}/resources`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-companies-email-connections`

API: `present` — `GET /api/companies/{companyId}/email/connections`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-companies-email-connections`

API: `present` — `POST /api/companies/{companyId}/email/connections`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-companies-email-connections-inspect`

API: `present` — `POST /api/companies/{companyId}/email/connections/{connectionId}/inspect`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-companies-email-connections-check-address`

API: `present` — `POST /api/companies/{companyId}/email/connections/{connectionId}/check-address`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-companies-email-inboxes`

API: `present` — `GET /api/companies/{companyId}/email/inboxes`; JSON REST.
Agent access: `available` — existing REST/native runtime tool or scoped gateway client, as documented by the linked route.
Policy: Existing run-bound tool, scoped credential lease, execution policy, or assigned-email-agent checks; connection-management grants do not bypass these controls.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-companies-email-inspect`

API: `present` — `POST /api/companies/{companyId}/email/inspect`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-companies-email-inboxes`

API: `present` — `POST /api/companies/{companyId}/email/inboxes`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-companies-email-deliveries`

API: `present` — `GET /api/companies/{companyId}/email/deliveries/{publicationId}`; JSON REST.
Agent access: `available` — existing REST/native runtime tool or scoped gateway client, as documented by the linked route.
Policy: Existing run-bound tool, scoped credential lease, execution policy, or assigned-email-agent checks; connection-management grants do not bypass these controls.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.
## `identity`

Capability ID: `chat-channels/identity`.

Review: `operation-reviewed`.

### `post-chat-endpoints-github-identity`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/identity`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `post-chat-endpoints-github-identity-start`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/identity/start`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-chat-endpoints-github-identity-confirm`

API: `present` — `POST /api/chat-endpoints/{endpointId}/github/identity/confirm`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `get-chat-endpoints-principals`

API: `present` — `GET /api/chat-endpoints/{endpointId}/principals`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-principals-link-intent`

API: `present` — `POST /api/chat-endpoints/{endpointId}/principals/{principalId}/link-intent`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `delete-chat-endpoints-principals-link`

API: `present` — `DELETE /api/chat-endpoints/{endpointId}/principals/{principalId}/link`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-identity-links-confirm`

API: `present` — `POST /api/chat-identity-links/confirm`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `post-chat-identity-links-request-access`

API: `present` — `POST /api/chat-identity-links/request-access`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `get-chat-identity-links-preview`

API: `present` — `GET /api/chat-identity-links/preview`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `get-api-chat-github-manifest-callback`

API: `present` — `GET /api/chat-github/manifest/callback`; browser/provider/MCP protocol.
Agent access: `restricted` — browser authentication return.
Policy: Provider state/signature or gateway-token verification, company and resource binding; browser returns require the configuring human. Agent-issued durable gateway tokens retain both issuer and responsible-user authority.
Evidence: `source-only` — [route](../../server/src/app.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `get-api-chat-github-cloud-callback`

API: `present` — `GET /api/chat-github/cloud/callback`; browser/provider/MCP protocol.
Agent access: `restricted` — browser authentication return.
Policy: Provider state/signature or gateway-token verification, company and resource binding; browser returns require the configuring human. Agent-issued durable gateway tokens retain both issuer and responsible-user authority.
Evidence: `source-only` — [route](../../server/src/app.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `get-api-chat-github-identity-callback`

API: `present` — `GET /api/chat-github/identity/callback`; browser/provider/MCP protocol.
Agent access: `restricted` — browser authentication return.
Policy: Provider state/signature or gateway-token verification, company and resource binding; browser returns require the configuring human. Agent-issued durable gateway tokens retain both issuer and responsible-user authority.
Evidence: `verified` — [route](../../server/src/app.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.
## `conversation`

Capability ID: `chat-channels/conversation`.

Review: `operation-reviewed`.

### `get-chat-endpoints-github-review-detail`

API: `present` — `GET /api/chat-endpoints/{endpointId}/github/reviews/{reviewId}`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-endpoints-github-reviews`

API: `present` — `GET /api/chat-endpoints/{endpointId}/github/reviews`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-endpoints-conversations`

API: `present` — `GET /api/chat-endpoints/{endpointId}/conversations`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-conversations-publications`

API: `present` — `POST /api/chat-endpoints/{endpointId}/conversations/{conversationId}/publications`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `get-chat-endpoints-conversations-publications-status`

API: `present` — `GET /api/chat-endpoints/{endpointId}/conversations/{conversationId}/publications/{publicationId}/status`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:use`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-issues-chat-binding`

API: `present` — `GET /api/issues/{issueId}/chat-binding`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`, responsible-user ceiling, task privacy, endpoint resource scope and target-agent visibility.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-api-chat-webhooks`

API: `present` — `POST /api/chat-webhooks/{publicId}/{provider}`; provider webhook ingress.
Agent access: `not-applicable` — provider-signed inbound events; agent keys and gateway tokens cannot authenticate this route.
Policy: The provider verifies the payload signature and binds the endpoint/company. The request has no agent principal.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Provider ingress has no agent invocation path. Provider signature validation remains required.

### `post-companies-email-send`

API: `present` — `POST /api/companies/{companyId}/email/send`; JSON REST.
Agent access: `available` — existing REST/native runtime tool or scoped gateway client, as documented by the linked route.
Policy: Existing run-bound tool, scoped credential lease, execution policy, or assigned-email-agent checks; connection-management grants do not bypass these controls.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-companies-email-tasks`

API: `present` — `GET /api/companies/{companyId}/email/tasks/{issueId}`; JSON REST.
Agent access: `available` — existing REST/native runtime tool or scoped gateway client, as documented by the linked route.
Policy: Existing run-bound tool, scoped credential lease, execution policy, or assigned-email-agent checks; connection-management grants do not bypass these controls.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-api-chat-webhooks-agentmail`

API: `present` — `POST /api/chat-webhooks/agentmail/{publicId}`; provider webhook ingress.
Agent access: `not-applicable` — provider-signed inbound events; agent keys and gateway tokens cannot authenticate this route.
Policy: The provider verifies the payload signature and binds the endpoint/company. The request has no agent principal.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Provider ingress has no agent invocation path. Provider signature validation remains required.
## `attachments`

Capability ID: `chat-channels/attachments`.

Review: `operation-reviewed`.

### `get-issues-attachments`

API: `present` — `GET /api/issues/{id}/attachments`; JSON REST.
Agent access: `available` — agent REST and native `search_api` / `call_api` for the attachment list.
Policy: Current company membership and task read/privacy authority. Connection management grants do not replace task access.
Evidence: `source-only` — [asset routes](../../server/src/routes/assets.ts).
Verification: `not-run` — list attachments with actual agent authentication and deny a foreign or private task.
Gaps: This operation has source review, not current-head HTTP verification.

### `post-companies-issues-attachments`

API: `present` — `POST /api/companies/{companyId}/issues/{issueId}/attachments`; multipart upload.
Agent access: `partial` — agent REST upload; native attachment tools and `register_deliverable` use their admitted resource paths and server-owned chat delivery. JSON-only `call_api` does not upload multipart content.
Policy: Task mutation/privacy authority, company/resource bounds, storage limits, and admitted native tool scope. Server-owned delivery does not grant endpoint administration.
Evidence: `source-only` — [asset routes](../../server/src/routes/assets.ts) and [native authority](../../server/src/services/native-runtime/paperclip-runner-tool-authority.ts).
Verification: `not-run` — upload through an admitted agent path, inspect the stored task attachment and outbound delivery, and deny a foreign task.
Gaps: Multipart upload is not a JSON native API call. Live chat file delivery remains unqualified by this connection setup audit.

### `post-chat-endpoints-publications-replay`

API: `present` — `POST /api/chat-endpoints/{endpointId}/publications/{publicationId}/replay`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `post-chat-endpoints-publications-resolve`

API: `present` — `POST /api/chat-endpoints/{endpointId}/publications/{publicationId}/resolve`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `post-chat-endpoints-actions-resolve`

API: `present` — `POST /api/chat-endpoints/{endpointId}/actions/{actionId}/resolve`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `post-companies-email-deliveries-resolve`

API: `present` — `POST /api/companies/{companyId}/email/deliveries/{publicationId}/resolve`; JSON REST.
Agent access: `restricted` — human connection manager records the outcome of an uncertain external delivery. Agents use normal governed send/status operations.
Policy: Existing run-bound tool, scoped credential lease, execution policy, or assigned-email-agent checks; connection-management grants do not bypass these controls.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.
## `lifecycle`

Capability ID: `chat-channels/lifecycle`.

Review: `operation-reviewed`.

### `post-chat-endpoints-slack-test-message`

API: `present` — `POST /api/chat-endpoints/{endpointId}/slack/test-message`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:use`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `verified` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above. [Authenticated fixtures](../../server/src/__tests__/connection-management.integration.test.ts) passed with database persistence and actual bearer/session middleware.
Verification: `passed` — deterministic provider fixtures / local assembled server; no live provider qualification.
Gaps: Provider fixtures do not qualify live provider setup or availability.

### `post-chat-endpoints-slack-resume`

API: `present` — `POST /api/chat-endpoints/{endpointId}/slack/resume`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-test`

API: `present` — `POST /api/chat-endpoints/{endpointId}/test`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-finish`

API: `present` — `POST /api/chat-endpoints/{endpointId}/finish`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-endpoints-test-status`

API: `present` — `GET /api/chat-endpoints/{endpointId}/test-status`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `get-chat-endpoints-activity`

API: `present` — `GET /api/chat-endpoints/{endpointId}/activity`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:view_audit`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-chat-endpoints-deliveries-replay`

API: `present` — `POST /api/chat-endpoints/{endpointId}/deliveries/{deliveryId}/replay`; JSON REST.
Agent access: `restricted` — existing human setup or approval surface; agent can identify the saved setup and inspect the result.
Policy: Human consent, identity confirmation, action approval, or trusted-host administration. This endpoint does not delegate human identity or self-approval to an agent.
Evidence: `source-only` — [route](../../server/src/routes/chat-channels.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: Agent invocation is denied by the stated policy. The authorized human or operator must perform this step; this entry does not claim delegated execution.

### `post-email-inboxes-control`

API: `present` — `POST /api/email/inboxes/{endpointId}/control`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

### `post-email-inboxes-reconnect`

API: `present` — `POST /api/email/inboxes/{endpointId}/reconnect`; JSON REST.
Agent access: `available` — agent REST and default native `search_api` / `call_api`.
Policy: `tools:manage_connections`; [shared management policy](../../doc/plans/2026-10-13-connection-api-parity.md#authorization-contract). Resolved resources and every affected target are checked; personal ownership remains the responsible user.
Evidence: `source-only` — [route](../../server/src/routes/email.ts); reviewed in the working tree based on the source commit above.
Verification: `not-run` — individual operation not executed in this audit; shared authorization and representative family flows are exercised by the authenticated integration suite. Follow the route schema, inspect persistence/audit, and assert owner, scope and revoked-authority denial.
Gaps: This individual operation has source review but no recorded HTTP verification. Provider availability and live setup remain unqualified.

## `outbound-email`

Capability ID: `chat-channels/outbound-email`.

Review: `baseline`.

API: `present` — GET /api/companies/{companyId}/email/inboxes; POST /api/companies/{companyId}/email/send for both send/reply; GET /api/companies/{companyId}/email/tasks/{issueId}; GET /api/companies/{companyId}/email/deliveries/{publicationId}. Administrative uncertain-outcome resolution uses POST /api/companies/{companyId}/email/deliveries/{publicationId}/resolve.

Agent access: `partial` — the assigned agent can use the email REST/CLI path with its actual active run and admitted email.send/email.reply policy. Board writers use their own credential authority. Availability of a CLI or scenario email tool does not establish that a native run has that tool binding or generic fallback admitted.

Policy: Agent sends require ownership of the inbox and source task, task read access, an available agent within budget, a running task run that owns execution/checkout, standard work mode, and no restricted external execution. Active endpoint, connection, credential access, and email.send/email.reply policy are rechecked. Authenticated board sends require active company membership and credential access; viewer sends additionally require instance-admin status. Local implicit authority skips the membership check. Agent reads retain task/inbox/company checks; board thread/delivery reads use the route’s company-access boundary. Delivery resolution requires board tools:manage_connections or existing elevated operator authority, not ordinary agent access.

Evidence: `source-only` — reviewed at `9ef434fe79c57d976b8b03b14c5242db270b8320`. [Email CLI](../../cli/src/commands/client/email.ts), [request schema](../../packages/shared/src/validators/email.ts), [email routes](../../server/src/routes/email.ts), and [email authority/publication](../../server/src/services/email-channels.ts).

Verification: `not-run` — Use the actual permitted writer and run to create one child/publication, confirm recipient delivery and an exact-message reply, and repeat idempotent requests without duplicate sends. Assert run/owner/mode/budget/company/credential/attachment denials and separate read access. Inspect the provider before resolving an unknown write outcome; a 202 or queued publication alone is not proof of delivery.

Gaps: Real AgentMail transport, recipient delivery, and each native tool binding still need live proof. Controlled provider receipts and inbound-reply recipes do not establish a newly initiated external email journey.
