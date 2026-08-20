# Enterprise Readiness and Open-Source Research Report

**Project:** Rental Marketplace (with legacy text-editor lineage)  
**Prepared:** 2026-08-18  
**Status:** Research baseline and upgrade backlog  
**Audience:** Maintainers, contributors, security reviewers, operators, and organizations evaluating self-hosting

## 1. Executive Summary

Enterprise readiness is not a single feature list. It is the ability to prove that the product is secure, reliable, governable, supportable, deployable in controlled environments, and usable at the customer's scale. Open source adds a second requirement: the same guarantees must be understandable and reproducible by a community that does not share the maintainer's infrastructure.

The repository already has a strong product and engineering foundation:

- A Next.js modular monolith with strict TypeScript boundaries.
- Supabase/PostgreSQL as the production authority, with RLS, normalized entities, audit events, idempotency, and outbox concepts.
- Typesense as a rebuildable derived index.
- Mock mode with synthetic Houston inventory and no paid credentials required.
- Zod validation, server-side authorization intent, rate-limit ports, security headers, signed uploads/webhooks, and documented backup/rollback practices.
- Domain-specific trust, provenance, freshness, duplicate, fee, and fair-housing guardrails.
- Vitest, Playwright, accessibility smoke coverage, linting, typechecking, and production build gates.

It is not yet possible to call the system enterprise-ready based on documentation alone. The largest gaps are evidence gaps and product-boundary gaps: the project must prove tenant isolation, recovery objectives, load behavior, upgrade safety, identity and lifecycle controls, data-subject workflows, dependency provenance, support commitments, and deployment reproducibility. The current documentation also contains a product identity conflict: the README presents a rental marketplace, while the implementation plan describes a text editor as the existing product. This must be resolved before external positioning or enterprise procurement.

### Recommended strategy

1. **Decide and document the product identity and deployment model.** Keep the rental marketplace as the product only if that is the deliberate direction; otherwise split or archive the legacy editor track.
2. **Make the current modular monolith production-proven before decomposing it.** Add tenant-aware authorization, evidence-producing controls, workload tests, and operational telemetry first.
3. **Offer two supported modes:** a hosted reference deployment and a documented self-hosted distribution with a support matrix.
4. **Build an open-source trust layer:** clear license, governance, security policy, reproducible releases, SBOM/provenance, upgrade guides, and contributor processes.
5. **Treat compliance as a mapped evidence program, not a badge.** Use NIST CSF 2.0, OWASP ASVS 5.0, WCAG 2.2 AA, NIST Privacy Framework, SOC 2 readiness, and ISO/IEC 27001 alignment as research and control-mapping anchors.

## 2. Scope and Evidence Rules

This report is based on the repository documents and package metadata available on 2026-08-18, especially:

- [README.md](../README.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [DATA_MODEL.md](../DATA_MODEL.md)
- [SECURITY.md](../SECURITY.md)
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- [docs/API.md](API.md)
- [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- [docs/SECURITY_OPERATIONS.md](SECURITY_OPERATIONS.md)
- [docs/ACCESSIBILITY_TESTING.md](ACCESSIBILITY_TESTING.md)
- `package.json` and the migration/test trees

A capability is marked **documented** when the repository describes it. It is **verified** only when automated tests, configuration inspection, a deployment exercise, or an independent assessment produces evidence. Enterprise claims should use the second category.

This is an engineering research report, not legal, tax, housing, accessibility, privacy, or audit advice. Housing and privacy obligations vary by jurisdiction and customer use case; counsel and qualified assessors are required before making regulated claims.

## 3. Enterprise Definition for This Product

For this project, enterprise level should mean:

- **Trust:** clear provenance, moderation, ranking, pricing, and audit explanations.
- **Security:** strong identity, authorization, tenant isolation, secure defaults, vulnerability response, and evidence.
- **Resilience:** defined availability, recovery time objective (RTO), recovery point objective (RPO), graceful degradation, and tested restore paths.
- **Governance:** organization administration, delegated roles, approvals, retention, legal holds, and change control.
- **Integration:** stable APIs, webhooks, SSO, SCIM or an equivalent lifecycle API, exports, and observability hooks.
- **Operability:** metrics, traces, structured logs, alerting, runbooks, safe migrations, and capacity planning.
- **Accessibility and inclusion:** WCAG 2.2 AA target with human testing, multilingual readiness, and fair-housing controls.
- **Open-source sustainability:** transparent governance, reproducible releases, security disclosure, licensing clarity, and contributor health.

Enterprise does not require microservices, every compliance certification, or every possible workflow on day one. It requires explicit boundaries, measurable guarantees, and a credible path from the default install to a controlled production deployment.

## 4. Current Strengths and Gaps

| Area | Current evidence | Gap or opportunity | Priority |
|---|---|---|---|
| Architecture | Modular monolith, typed provider ports, authoritative PostgreSQL, derived search index | No documented scale envelope, isolation model, or dependency failure budget | P0 |
| Authorization | Server sessions, role checks, RLS described | Need integration tests proving cross-tenant and role isolation; browser claims must never influence decisions | P0 |
| Auditability | Immutable audit events described for consequential actions | Need event schema, retention rules, actor/session/request correlation, export, and tamper-evidence review | P0 |
| Security | Zod, headers, rate limits, signed uploads/webhooks, redaction described | Need ASVS coverage, threat-model refresh, penetration testing, dependency/SBOM policy, and disclosure process | P0 |
| Reliability | Health/readiness, PITR recommendation, rollback runbook | Need measured RTO/RPO, restore drills, SLOs, dependency timeouts, queue recovery, and capacity tests | P0 |
| Data governance | Data minimization and export/deletion are documented | Need retention matrix, deletion proof, legal hold behavior, regional residency options, and processor inventory | P1 |
| Identity | Supabase Auth boundary and MFA recommendation | Need enterprise SSO, SAML/OIDC decision, domain verification, SCIM/lifecycle, session policy, and admin break-glass | P0 |
| APIs | Consistent envelopes, pagination, idempotency guidance | Need versioning, OpenAPI, quotas, webhook catalog, compatibility policy, and API key/service-account model | P1 |
| Search | Outbox-fed Typesense with PostgreSQL fallback | Need lag/error SLOs, reindex capacity, zero-downtime schema migration, tenant filtering, and relevance evaluation | P1 |
| Ingestion | Provenance, source records, import validation, licensed adapter boundary | Need connector SDK, license/terms register, source freshness contracts, backpressure, quarantine, and replay tooling | P1 |
| Accessibility | Accessibility smoke tests and keyboard/reduced-motion intent | Need full WCAG 2.2 AA audit, editor/screen-reader testing, VPAT/ACR evidence, and accessible authentication | P1 |
| Compliance | Security and operational runbooks exist | No control matrix, evidence owner, audit cadence, or independent attestation | P1 |
| Open source | Repository documentation and local mock mode are promising | Need LICENSE, CONTRIBUTING, CODEOWNERS, governance, release policy, SBOM, signing, support matrix, and security.txt | P0 |
| Product clarity | Marketplace routes and domain model are extensive | Implementation plan still describes a text editor; resolve scope and public product promise | P0 |

## 5. Research Tracks

### 5.1 Product identity, personas, and tenancy

**Investigate**

- Is the product exclusively a rental marketplace, or is a reusable text-editing platform still an intended product line?
- Who is the enterprise customer: property operators, listing aggregators, public agencies, providers, or self-hosting teams?
- Is the unit of isolation an organization, property manager, provider account, geographic market, or deployment?
- Which data must be globally discoverable, organization-private, or user-private?
- Does one deployment serve many organizations, or does each customer receive a dedicated installation?

**Gap**

The data model has organizations and provider accounts, but the enterprise contract for tenant boundaries, shared inventory, cross-organization administration, and data residency is not yet explicit. This is the controlling decision for RLS, indexes, cache keys, exports, analytics, and support access.

**Opportunity**

Create a written tenancy model and authorization matrix before adding features. Prefer organization-scoped records with explicit membership and resource sharing rules. Include `organization_id` in every tenant-owned table, every cache/index key, every audit event, and every background job payload where applicable. Use database policies as a second boundary, not as the only explanation of authorization.

**Acceptance evidence**

- A threat-model diagram showing browser, API, worker, database, search, storage, and operator access.
- A role-resource-action matrix with deny-by-default behavior.
- Automated tests attempting cross-organization reads, writes, exports, search, media access, and job execution.
- A documented decision for shared public listings and private provider data.

### 5.2 Enterprise identity and lifecycle

**Investigate**

- SAML 2.0, OIDC, or both for SSO.
- SCIM 2.0 or a documented provisioning/deprovisioning alternative.
- Domain discovery and verified email domains.
- MFA enforcement, WebAuthn/passkeys, recovery, session duration, device/session revocation, and step-up authentication.
- Service accounts, API keys, workload identity, and break-glass administration.
- Just-in-time provisioning and mapping IdP groups to application roles.

**Gap**

The repository describes Supabase Auth and MFA recommendations but not enterprise federation, automated lifecycle, or support-safe administrative access.

**Opportunity**

Implement identity behind a provider interface. Keep local development usable with a mock identity provider, while providing a production OIDC/SAML adapter. Record identity events without storing unnecessary assertion contents. Require step-up authentication for exports, role changes, moderation, provider verification, and destructive actions.

**Acceptance evidence**

- SSO integration tested against at least one OIDC and one SAML-compatible provider.
- Deprovisioned users lose access to web, API, search, storage, and queued jobs within a defined maximum delay.
- Admin actions require MFA/step-up and emit audit events.
- Customer administrators can inspect and revoke active sessions.

### 5.3 Security engineering and privacy

**Investigate**

Map the application to OWASP ASVS 5.0 and NIST CSF 2.0. Use the NIST Privacy Framework to structure data processing risks. Confirm the exact obligations for the jurisdictions and housing workflows served.

**Current strengths**

The project already documents input validation, server authorization, RLS, rate limiting, CSP/security headers, signed uploads, malware scanning adapters, signed webhooks, replay safety, redaction, minimization, and fair-housing constraints.

**Gaps**

- No visible ASVS requirement-to-test matrix.
- No formal data inventory and processing register.
- No published vulnerability disclosure policy or security contact in the repository evidence reviewed.
- No stated dependency patch SLA or severity rubric.
- No evidence of secret scanning, SBOM generation, artifact signing, or provenance verification.
- No independent penetration test or abuse-case assessment.
- No documented key-management and rotation ownership model.
- No explicit cache poisoning, search-filter bypass, webhook SSRF, image parser, or authorization race test plan.

**Upgrade opportunities**

- Add a versioned threat model and security control matrix under `docs/security/`.
- Add automated checks for dependency vulnerabilities, secrets, licenses, lockfile drift, and insecure configuration.
- Generate an SBOM for every release; publish build provenance and signed checksums.
- Define security advisories, severity, response targets, supported versions, and coordinated disclosure.
- Add negative tests for every privileged route and RLS policy.
- Establish a regular external review of authentication, tenant isolation, uploads, importers, moderation, and ranking.
- Use policy-as-code where jurisdiction rules, moderation gates, or deployment controls need versioned review. A policy engine such as OPA is an option, but it should be introduced only where policy complexity justifies the operational cost.

**Acceptance evidence**

- ASVS coverage report with explicit exclusions.
- Threat-model findings tracked to issues and tests.
- SBOM, signed release artifact, provenance statement, and reproducible-build instructions.
- Published security policy and a tested incident response exercise.

### 5.4 Reliability, performance, and disaster recovery

**Investigate**

- Expected listings, users, organizations, imports, searches per second, concurrent sessions, media volume, and alert volume at 1x, 10x, and 100x current fixtures.
- Availability target by workflow: public search, provider editing, moderation, authentication, ingestion, and alerts.
- RTO/RPO per data class.
- Failure behavior when Supabase, Typesense, QStash, storage, email, geocoding, or analytics is degraded.
- Regional failover and vendor portability.

**Gap**

The runbooks recommend PITR and restore drills, but the repository does not yet show measured recovery objectives, load-test baselines, SLO dashboards, queue poison-message handling, or a dependency failure budget.

**Upgrade opportunities**

- Define SLOs, SLIs, and error budgets per critical user journey.
- Instrument request, database, search, queue, external provider, and storage latency with trace correlation.
- Add load tests for search, listing submission, imports, moderation queues, and reindexing.
- Set explicit timeouts, retries with jitter, circuit breakers, maximum payloads, and dead-letter/replay behavior.
- Make Typesense rebuild and database restore rehearsable from a clean environment.
- Test forward migrations against production-sized data and support zero-downtime application/schema compatibility.
- Provide a documented single-node development deployment and a reference production topology.

**Suggested initial targets to validate, not promise prematurely**

- Public search availability: 99.9% monthly.
- Critical write availability: 99.9% monthly.
- Search p95 latency: under 500 ms at the agreed workload.
- Search index freshness: 99% of successful writes indexed within five minutes.
- RPO: 15 minutes or better for durable transactional data.
- RTO: four hours or better for the reference deployment.

These targets require measurement and customer feedback before becoming contractual commitments.

### 5.5 Data, search, and ingestion quality

**Investigate**

- Source licensing, terms of use, retention, and removal obligations for every connector.
- Canonical identity and duplicate resolution across sources.
- Freshness requirements by listing type and market.
- Provenance display, correction workflow, takedown workflow, and source dispute handling.
- Search relevance, sponsored placement governance, explainability, and fairness monitoring.
- Data lineage from source observation to canonical listing to index to public result.

**Current opportunity**

The existing hierarchy of properties, buildings, units, listings, and source records is a strong base for lineage. Make that lineage visible as an operational product: import run, observation time, normalization result, moderation decision, index version, and last successful publication.

**Upgrade opportunities**

- Add a connector SDK with schema contracts, rate limits, test fixtures, and replayable imports.
- Add data-quality checks for address completeness, price anomalies, stale inventory, impossible fee combinations, duplicate candidates, and provenance loss.
- Give operators a quarantine and replay UI for bad records.
- Version search schemas and ranking rules; evaluate relevance on a labeled query set.
- Partition public and private search documents so provider-sensitive fields cannot leak through search.
- Add customer export/import formats and a migration path away from Typesense if self-hosting requires another search engine.

### 5.6 API, integration, and developer platform

**Investigate**

- Is the API public, partner-only, or internal?
- What compatibility guarantee is required: semantic versioning, date-based versions, or a supported-version window?
- Which events need webhooks: listing changes, moderation decisions, verification changes, leads, exports, and incidents?
- What are the quota, pagination, filtering, export, and retry semantics?

**Gap**

The API envelope and idempotency guidance are good foundations, but there is no visible OpenAPI contract, compatibility policy, API key lifecycle, webhook catalog, or SDK strategy.

**Upgrade opportunities**

- Publish OpenAPI from the route schemas and validate it in CI.
- Introduce explicit API versions and deprecation headers.
- Define idempotency retention, conflict behavior, replay behavior, and idempotency scope.
- Add signed webhooks with event IDs, timestamps, replay windows, delivery attempts, and customer-managed endpoints.
- Provide a CLI and typed SDK for common administration and import workflows.
- Support bulk export and asynchronous jobs for enterprise data volumes.

### 5.7 Operations, observability, and customer support

**Investigate**

- Who operates hosted instances and who operates self-hosted instances?
- What support response times are possible for community, standard, and enterprise users?
- Which telemetry is mandatory, optional, or disabled in self-hosted mode?
- Can operators diagnose a failed request using only request ID, trace ID, audit event, and job ID?

**Gap**

Sentry/PostHog adapters and health/readiness endpoints are documented, but the operational contract is not: dashboards, alerts, retention, ownership, escalation, and customer-facing status communication are missing.

**Upgrade opportunities**

- Define an OpenTelemetry-compatible instrumentation strategy.
- Publish redaction rules and a self-hosted telemetry configuration.
- Add dashboards for availability, latency, error classes, queue lag, search freshness, imports, moderation backlog, auth failures, and storage failures.
- Add an operator diagnostics bundle that contains safe metadata, never message bodies or secrets.
- Publish status-page and incident-communication templates.
- Version runbooks and conduct game days for database outage, search outage, bad import, credential compromise, and data deletion failure.

### 5.8 Accessibility, housing safety, and internationalization

**Investigate**

- Target WCAG 2.2 Level AA and applicable public-sector or procurement requirements.
- Screen-reader and keyboard behavior for search/map/moderation flows.
- Accessible authentication, error recovery, focus handling, reduced motion, and mobile reflow.
- Language, currency, date, measurement, timezone, jurisdiction, and address normalization requirements.
- Local housing-law rules, source obligations, fair-housing review, and complaint/takedown response.

**Current strengths**

The repository already describes fair-housing guardrails, rejection of protected-class ranking criteria, provider-reported labeling, accessibility smoke coverage, keyboard flows, and reduced-motion support.

**Gaps and opportunities**

- Automated axe checks do not establish full conformance; add manual assistive-technology testing and a recorded accessibility conformance report.
- Add a jurisdiction rules registry with effective dates, owners, tests, and explainable outcomes.
- Make map interactions fully keyboard and screen-reader usable, with a list alternative that preserves all functionality.
- Add localization architecture before expanding beyond Houston.
- Never use a safety, neighborhood, or demographic score as an opaque ranking shortcut.
- Give users a clear route to report discrimination, inaccurate data, fraud, privacy issues, or accessibility barriers.

### 5.9 Open-source productization and governance

**Investigate**

- Which license supports the intended ecosystem and hosted-service strategy?
- Who owns trademarks, domains, fixtures, images, documentation, and contributed code?
- Is governance controlled by one maintainer, a committee, a foundation, or a company with a public advisory process?
- What is the supported release cadence and end-of-life policy?
- What is free in core and what belongs in optional enterprise adapters?

**Minimum open-source package**

- An OSI-approved `LICENSE` and third-party notices.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, and `GOVERNANCE.md`.
- `CODEOWNERS`, branch protection, review requirements, and a release checklist.
- Reproducible local setup with synthetic data and no paid credentials.
- `.env.example` with safe defaults and explicit production warnings.
- Versioned migrations, seed policy, upgrade/rollback guidance, and compatibility matrix.
- Automated CI for tests, lint, typecheck, build, E2E, accessibility, dependency audit, secret scanning, license scanning, SBOM, and release signing.
- Public roadmap and decision records for high-impact architecture or policy changes.
- A clear boundary between community support, managed hosting, and paid implementation/support.

**Important distinction**

Open source does not mean that hosted enterprise features must all be in the same repository. It does mean that the core behavior, deployment assumptions, security boundaries, and extension points are documented honestly. Avoid using an open-core split to hide critical security fixes or make the community edition impossible to operate.

## 6. Recommended Target Architecture

Keep the modular monolith as the default architecture until measurements show a real need to split. Establish stable ports around the following concerns:

```text
Web and API
  -> authentication and authorization policy
  -> domain services
     -> PostgreSQL authority and RLS
     -> outbox and idempotent workers
     -> search adapter
     -> object storage adapter
     -> email/notification adapter
     -> observability and audit adapters
  -> policy and jurisdiction rules
  -> export/import and integration APIs
```

### Boundaries to strengthen

- **Identity boundary:** user, organization, membership, roles, SSO claims, service accounts.
- **Authorization boundary:** resource policy evaluated server-side and tested independently of UI.
- **Data boundary:** tenant-owned, public, derived, sensitive, and audit data categories.
- **Job boundary:** signed, idempotent, retryable, observable jobs with dead-letter handling.
- **Provider boundary:** every external service can be disabled, timed out, replaced, and locally mocked.
- **Release boundary:** migrations, application versions, search schema versions, and adapters have compatibility rules.
- **Policy boundary:** moderation, housing, privacy, and jurisdiction rules are versioned and explainable.

Do not move to microservices until a module has an independent scaling, isolation, deployment, or ownership requirement. A service split before these boundaries are tested would increase operational complexity without proving enterprise value.

## 7. Prioritized Roadmap

### Phase 0: decision and evidence reset, 0-4 weeks

- Resolve marketplace versus text-editor product identity.
- Write the tenancy and deployment model.
- Add license, governance, contribution, support, and vulnerability-disclosure documents.
- Build the role-resource-action matrix and data classification/retention matrix.
- Inventory dependencies, external processors, source licenses, and production secrets.
- Create a control/evidence register mapped to NIST CSF 2.0 and OWASP ASVS 5.0.

**Exit criteria:** the public product promise, supported deployment modes, and non-negotiable security boundaries are unambiguous.

### Phase 1: enterprise foundation, 1-3 months

- Add cross-tenant/RLS integration tests and privileged-route negative tests.
- Implement SSO decision and first OIDC/SAML adapter.
- Add session/device administration, step-up authentication, and service-account strategy.
- Publish OpenAPI and API compatibility rules.
- Add structured audit events with request, actor, organization, target, reason, and outcome.
- Add SBOM, dependency/license/secret scanning, signed artifacts, and provenance.
- Define SLOs, dashboards, alerts, and safe telemetry defaults.
- Run load tests and a full restore drill.

**Exit criteria:** a reviewer can reproduce the security baseline, an operator can diagnose common failures, and a customer can integrate identity and APIs.

### Phase 2: scale and governance, 3-6 months

- Add SCIM or a documented lifecycle API.
- Add connector SDK, quarantine/replay, freshness metrics, and data-quality controls.
- Version search schemas and ranking rules; add relevance evaluation.
- Add tenant-aware asynchronous exports and customer-managed webhooks.
- Complete WCAG 2.2 AA audit scope and manual assistive-technology tests.
- Add retention/deletion/legal-hold implementation and evidence.
- Test zero-downtime migrations and dependency degradation at scale.

**Exit criteria:** the system has a measured capacity envelope, repeatable recovery, controllable data lifecycle, and stable extension contracts.

### Phase 3: assurance and ecosystem, 6-12 months

- Commission an independent penetration test and remediate findings.
- Prepare SOC 2 readiness evidence; assess whether ISO/IEC 27001 certification is commercially justified.
- Publish an accessibility conformance report/VPAT where appropriate.
- Add regional deployment/residency options if customer research justifies them.
- Establish a public release train, LTS policy, community metrics, and maintainer succession plan.
- Run quarterly incident and recovery exercises.

**Exit criteria:** enterprise claims are backed by current evidence, not only roadmap intent.

## 8. Investigation Backlog

Use these as research issues or decision records. Each item should have an owner, due date, evidence link, and decision status.

| ID | Investigation question | Deliverable | Priority |
|---|---|---|---|
| ER-001 | What is the single product identity and supported use case? | Product boundary ADR | P0 |
| ER-002 | What is the tenant, sharing, and residency model? | Tenancy ADR and authorization matrix | P0 |
| ER-003 | Can one organization access another organization's records through any path? | RLS and route isolation test suite | P0 |
| ER-004 | What are RTO, RPO, SLO, and capacity targets? | Reliability targets and load-test report | P0 |
| ER-005 | What identity integrations do target buyers require? | SSO/SCIM decision and provider contract | P0 |
| ER-006 | Which controls map to ASVS 5.0 and NIST CSF 2.0? | Control/evidence matrix | P0 |
| ER-007 | Can a clean machine reproduce a release and verify its provenance? | Release reproducibility report | P0 |
| ER-008 | What data is collected, why, where, and for how long? | Data inventory and retention schedule | P1 |
| ER-009 | What is the API compatibility and webhook contract? | OpenAPI, versioning, and webhook specification | P1 |
| ER-010 | What data-quality and source-license obligations apply to each connector? | Connector register and ingestion policy | P1 |
| ER-011 | Does the complete user workflow meet WCAG 2.2 AA with assistive technology? | Accessibility test report and remediation plan | P1 |
| ER-012 | What support model can maintainers actually operate? | Support matrix, status process, escalation runbook | P1 |
| ER-013 | Is regional deployment needed? | Residency and deployment options paper | P2 |
| ER-014 | Which modules, if any, need independent scaling or deployment? | Modular-monolith boundary review | P2 |

## 9. Metrics That Matter

Track a small set of outcome metrics rather than collecting telemetry without a decision attached:

- **Security:** critical vulnerabilities beyond SLA, privileged-action test coverage, MFA coverage, unresolved high-risk findings, time to rotate a compromised secret.
- **Reliability:** availability by journey, p95/p99 latency, error-budget consumption, restore success, RTO/RPO results, queue age, failed job replay rate.
- **Data quality:** stale listing rate, duplicate review rate, provenance completeness, import rejection rate, correction/takedown response time, search freshness.
- **Governance:** access-review completion, deprovisioning delay, export/deletion completion, audit-event coverage, policy exception age.
- **Developer experience:** clean-install success, time to first local demo, release lead time, rollback time, CI duration, issue response time.
- **Open source health:** external contributors, review latency, bus-factor risk, release cadence, security advisory response, documentation freshness.
- **Accessibility:** open accessibility defects by severity, manual workflow coverage, keyboard completion rate, screen-reader blockers, reduced-motion regressions.

## 10. Research References

These are starting points for investigation and control mapping; they do not by themselves establish compliance:

- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework): cybersecurity risk-management outcomes and profiles.
- [OWASP Application Security Verification Standard 5.0](https://owasp.org/www-project-application-security-verification-standard/): testable web-application security requirements suitable for development and procurement.
- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001): requirements for an information security management system.
- [AICPA SOC Suite](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services): assurance-report context for service organizations.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/): testable accessibility success criteria, including keyboard access, focus, authentication, reflow, and status messages.
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework): privacy-risk identification and management guidance.
- [SLSA](https://slsa.dev/spec/v1.2/): software supply-chain integrity and provenance guidance. Confirm the current version before implementation because older specifications may be retired.
- [OpenSSF Best Practices](https://www.bestpractices.dev/en): open-source project security and maintenance practices.
- [Open Policy Agent](https://www.openpolicyagent.org/docs/latest/): an option for decoupled, versioned policy decisions where application policy complexity warrants it.

## 11. Definition of Enterprise-Ready

Do not use the label until all P0 items have evidence and the following are true:

- A new operator can deploy the supported reference topology from documented instructions.
- A customer can configure identity, organizations, roles, exports, and integrations without maintainer intervention.
- Tenant isolation is enforced and tested across UI, APIs, search, storage, jobs, analytics, and support tooling.
- Critical data can be restored within the documented RTO/RPO, and the exercise has been repeated.
- Releases are tested, signed, traceable to source, and accompanied by an SBOM and migration notes.
- Security incidents, vulnerabilities, data requests, outages, and accessibility barriers have owned response paths.
- Public claims distinguish implemented, adapter-complete, documented, and independently verified capabilities.
- The open-source community can run the core product, understand its boundaries, report vulnerabilities, and contribute safely.

The main opportunity is not to add every enterprise feature. It is to convert this repository's strong design intent into repeatable evidence, explicit customer contracts, and a sustainable open-source operating model.
