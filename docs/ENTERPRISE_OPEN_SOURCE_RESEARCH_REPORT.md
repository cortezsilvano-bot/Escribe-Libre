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

*Mode: Deep Research | 8/20/2026, 5:50:03 AM*

---

# Model: DeepSeek-Coder-6.7B

## Summary

**Terms and Structure:**

---

# Model: GPT-5.4 Mini

## Summary

## Executive summary

The repository shows **strong architectural intent** for an enterprise-grade, open-source rental marketplace, but it is **not yet provable as enterprise-ready** from the available documentation alone.

### What is already strong

- **Modular monolith architecture** with strict TypeScript boundaries.
- **Supabase/PostgreSQL** as the source of truth, with RLS, normalized entities, audit events, idempotency, and outbox patterns.
- **Typesense** used as a rebuildable derived index rather than the authority.
- **Mock mode** with synthetic Houston inventory and no paid credentials required.
- **Security and validation controls**: Zod validation, server-side authorization intent, rate-limit ports, security headers, signed uploads/webhooks, and backup/rollback documentation.
- **Domain guardrails** for trust, provenance, freshness, duplicate handling, fee logic, and fair-housing concerns.
- **Operational quality gates**: Vitest, Playwright, accessibility smoke coverage, linting, typechecking, and production build checks.

### What prevents an enterprise-ready claim today

The main blockers are not just missing features; they are **missing evidence** and **missing product decisions**:

1. **Product identity conflict**: the repository appears to describe a rental marketplace, but the implementation plan still refers to a text editor lineage. This must be resolved before external positioning.
2. **Tenant isolation is not yet proven**: the repo documents RLS and org concepts, but does not yet provide a complete, test-backed isolation model across UI, APIs, search, storage, jobs, and support tooling.
3. **Recovery and scale are not yet measured**: RTO/RPO, SLOs, capacity envelopes, restore drills, and degradation behavior need evidence.
4. **Identity lifecycle is incomplete**: there is no documented enterprise SSO/SCIM strategy, lifecycle automation, session controls, or break-glass model.
5. **Security assurance is incomplete**: there is no visible ASVS mapping, SBOM/provenance workflow, vulnerability disclosure policy, or independent validation.
6. **Open-source operating model is incomplete**: missing or unverified items include license clarity, governance, contribution policy, support policy, release signing, and reproducible release evidence.

### Recommended posture

The most credible path is to **keep the modular monolith**, harden the enterprise boundaries, and publish an evidence-based open-source operating model before attempting larger decomposition.

### Bottom line

The project is best described as **architecturally promising and operationally well-started**, but **not yet enterprise-ready in a procurement-grade sense** until the P0 evidence gaps are closed and the product identity is made explicit.

---

## Key Findings

## 1) Architecture is strong, but scale and isolation are not yet evidenced

The codebase appears to be a **Next.js modular monolith** with typed ports around identity, storage, search, and observability. That is a good enterprise default because it reduces operational complexity while the product matures.

**What is documented:**
- PostgreSQL/Supabase is the authority.
- Typesense is a derived, rebuildable search index.
- Outbox/idempotency concepts exist.
- Background and adapter boundaries are already considered.

**What is missing:**
- A documented **scale envelope** (users, listings, requests, imports, search volume).
- A tested **isolation model** for orgs/tenants.
- Failure budgets and dependency degradation behavior.

### Why this matters
Enterprise buyers want to know not just that the architecture is clean, but that it behaves predictably under stress and in shared environments.

---

## 2) Tenant isolation is the highest-priority technical risk

The repo already mentions organizations, roles, and RLS, but enterprise readiness requires proving that **no cross-tenant access path exists** through:

- API routes
- database policies
- search indices
- file/object storage
- background jobs
- admin/support tooling
- exports and analytics

**Needed evidence:**
- Role/resource/action matrix
- Cross-tenant negative tests
- Threat model showing browser/API/worker/db/search/storage trust boundaries
- Explicit treatment of shared public listings vs private provider data

### Key point
RLS is important, but it must be treated as **one boundary, not the entire authorization story**.

---

## 3) Identity and lifecycle controls are enterprise-critical and currently incomplete

The documentation suggests Supabase Auth and MFA recommendations, but enterprise buyers usually require:

- SSO via **OIDC and/or SAML**
- **SCIM** or equivalent provisioning/deprovisioning
- Session management and revocation
- Break-glass admin access
- Step-up authentication for exports, role changes, moderation, and destructive actions
- Service accounts and API identities

**Gap:** the repo does not yet show a provider-agnostic identity layer or a lifecycle contract.

### Why this matters
Without lifecycle controls, organizations cannot safely onboard/offboard employees or comply with access governance expectations.

---

## 4) Security controls exist, but assurance is incomplete

The project already documents several strong controls:

- Input validation via Zod
- Security headers and CSP intent
- Rate-limit ports
- Signed uploads and signed webhooks
- Redaction/minimization guidance
- Fair-housing guardrails

**Missing assurance evidence:**
- ASVS requirement-to-test mapping
- Threat-model refresh and tracked remediation
- SBOM generation and artifact signing
- Provenance/reproducible-build instructions
- Vulnerability disclosure process and security contact
- Pen test or external security review

### Practical implication
The product may be reasonably secure in design, but it cannot yet make a strong enterprise security claim without evidence artifacts.

---

## 5) Reliability is documented, but not yet measured

There are documented recommendations for PITR and rollback, but enterprise readiness needs operational proof:

- **RTO** and **RPO** targets
- Restore drills
- SLOs and error budgets
- Queue poison-message handling
- Search/index rebuild timing
- Degraded dependency behavior
- Load testing at realistic volumes

### Suggested initial targets to validate
- Public search availability: **99.9% monthly**
- Critical write availability: **99.9% monthly**
- Search p95 latency: **< 500 ms** at agreed load
- Search freshness: **99% indexed within 5 minutes**
- RPO: **15 minutes or better**
- RTO: **4 hours or better**

These should be treated as **hypotheses to validate**, not promises to customers yet.

---

## 6) Data governance exists conceptually, but retention and residency are not fully defined

The repository already discusses minimization, export, and deletion concepts, which is a good base. But enterprise and regulated customers usually need:

- Retention schedules
- Legal hold behavior
- Data residency options
- Processor inventory
- Deletion proof
- Data classification by sensitivity and purpose

### Why this matters
Even if the system is technically secure, unclear retention and residency handling can block procurement.

---

## 7) Search and ingestion are promising, but operational controls need more rigor

The architecture of authoritative database + derived search index is sound. However, the following still need stronger definition:

- Search freshness SLOs
- Index lag alerts
- Zero-downtime reindex strategy
- Schema/ranking versioning
- Tenant filtering guarantees
- Connector licensing and source-terms tracking
- Data-quality quarantine and replay workflows

### Important nuance
Search should remain a **derived subsystem**, never the source of truth for authorization or persistence.

---

## 8) Accessibility and fair-housing controls are a meaningful strength, but not yet complete evidence

The repository already includes accessibility smoke testing and fair-housing guardrails, which is better than many early-stage projects.

**Still needed for stronger claims:**
- Full WCAG 2.2 AA audit coverage
- Manual screen-reader and keyboard testing
- Accessible authentication and error recovery
- A conformance report or VPAT-style evidence where relevant
- Jurisdiction rules registry and explainable policy outcomes

### Important caution
Automated accessibility tests are useful, but they do **not** prove full compliance.

---

## 9) Open-source sustainability is a major opportunity and a major gap

For a community-hostable enterprise project, the repo should publish the trust framework needed for outsiders to operate it safely.

**Minimum missing or unverified elements:**
- OSI-approved license
- CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / SUPPORT / GOVERNANCE docs
- CODEOWNERS and release policy
- Signed releases and reproducibility guidance
- SBOM and provenance
- Clear community vs paid support boundaries
- Public vulnerability disclosure process

### Why this matters
Open source is not just source availability; it is the ability for others to understand, reproduce, support, and safely extend the software.

---

## 10) The product identity conflict must be resolved before enterprise positioning

This is one of the most important non-technical findings.

The repository materials indicate a **rental marketplace**, but the implementation plan apparently retains a **legacy text-editor** description. That creates ambiguity in:

- roadmap interpretation
- feature prioritization
- security/compliance scope
- buyer expectations
- contributor alignment

### Recommendation
Publish a formal decision record that answers:

- What is the current product?
- What is legacy and what is active?
- Is the text-editor lineage abandoned, archived, or still a supported product line?
- Which deployment model is promised to customers?

---

## 11) Best enterprise path: evidence first, decomposition later

The report strongly supports a **modular monolith hardening strategy** before microservice decomposition.

### The right near-term sequence
1. Resolve product identity.
2. Write the tenancy and deployment model.
3. Prove cross-tenant isolation.
4. Implement enterprise identity lifecycle.
5. Publish security and release evidence.
6. Measure reliability and restoreability.
7. Then consider scaling out modules only where real operational need exists.

This sequence is more credible than introducing microservices prematurely.

---

## Comparisons

## Current state vs. enterprise-ready baseline

| Dimension | Current repository evidence | Enterprise-ready expectation | Assessment |
|---|---|---|---|
| Architecture | Modular monolith, typed ports, PostgreSQL authority, derived search | Stable boundaries, documented scale envelope, tested failure behavior | **Strong foundation, incomplete evidence** |
| Authorization | RLS and server-side checks described | Cross-tenant isolation proven by tests across all paths | **Promising, not yet provable** |
| Identity | Supabase Auth, MFA recommendation | SSO, SCIM/equivalent, session policy, break-glass, service accounts | **Incomplete** |
| Security assurance | Validation, headers, signed webhooks/uploads | ASVS mapping, SBOM, signed releases, disclosure policy, pen test | **Partial** |
| Reliability | Health/readiness, PITR guidance, rollback docs | Measured SLOs, RTO/RPO, restore drills, load tests, incident exercises | **Partial** |
| Data governance | Export/delete concepts, minimization intent | Retention matrix, legal hold, residency, processor inventory | **Incomplete** |
| Search | Rebuildable Typesense index | Freshness SLOs, reindex playbooks, schema versioning, tenant-safe search | **Partial** |
| Ingestion | Provenance and validation concepts | Connector SDK, source licensing register, quarantine/replay, freshness contracts | **Partial** |
| Accessibility | Smoke tests, keyboard/reduced-motion intent | WCAG 2.2 AA manual verification and conformance evidence | **Partial** |
| Open source ops | Documentation and local mock mode | License, governance, support, reproducible builds, signed releases | **Incomplete** |
| Product clarity | Marketplace docs vs text-editor lineage conflict | Single explicit product identity and scope boundary | **Blocker** |

---

## Modular monolith vs microservices

### What the current design does well
A modular monolith is often the best structure for an emerging enterprise open-source product because it:

- keeps integration simpler,
- reduces distributed failure modes,
- makes authorization easier to reason about,
- supports faster refactoring,
- and allows evidence collection before decomposition.

### What microservices would add too early
If introduced before boundaries are proven, microservices would likely add:

- more deployment complexity,
- more operational overhead,
- harder debugging,
- weaker transactional guarantees,
- and more ways for tenant isolation to fail.

### Conclusion
The repository’s current direction is better than a premature service split. The product should **earn decomposition** through measured load, ownership boundaries, or isolation needs.

---

## Open-source readiness vs closed enterprise packaging

### Open-source readiness means
- outsiders can clone, build, run, and understand the system,
- support and security expectations are documented,
- provenance and release artifacts are reproducible,
- and the community can safely contribute.

### Enterprise readiness means
- the system can be operated under customer constraints,
- governance and identity are controlled,
- SLAs/SLOs exist,
- security and recovery are evidenced,
- and compliance-relevant controls are auditable.

### Current positioning
This project appears **closer to open-source-ready than enterprise-ready**, but with a strong path toward both if the evidence gaps are closed.

---

## Documented vs verified

A major comparison point in this research is the distinction between what is **documented** and what is **verified**.

- **Documented**: the repository says the capability exists or is intended.
- **Verified**: tests, exercises, config inspection, or external review prove it works.

### Enterprise rule of thumb
If a capability affects security, tenancy, recovery, or customer trust, it should not be marketed as enterprise-grade until it is **verified**.

---

## Suggestions

## Highest-priority actions

### 1) Resolve product identity immediately
Create a short decision record that states:

- what the product is,
- what it is not,
- whether the text-editor lineage is active or legacy,
- and what deployment model is being supported.

**Deliverable:** `docs/adr/product-boundary.md`

---

### 2) Write a tenancy and authorization matrix
Define tenant scope, shared resources, public data, private data, admin scopes, and support access.

**Include:**
- resource ownership model,
- role-to-action permissions,
- org boundary rules,
- cache/index/job key scoping,
- and explicit deny-by-default behavior.

**Deliverable:** `docs/security/authorization-matrix.md`

---

### 3) Prove cross-tenant isolation with tests
Add negative tests for:

- cross-org read/write/delete,
- search filtering bypass,
- storage object access,
- export leakage,
- background job execution,
- and support/admin tooling.

**Deliverable:** a CI-gated test suite demonstrating isolation.

---

### 4) Implement enterprise identity lifecycle
Decide on SSO and provisioning strategy, then document and test it.

**Minimum target:**
- OIDC and/or SAML,
- SCIM or a documented lifecycle API,
- session revocation,
- step-up auth for privileged actions,
- and break-glass admin access.

**Deliverable:** `docs/identity/enterprise-identity.md`

---

### 5) Publish a security assurance package
Create a versioned evidence set that includes:

- ASVS mapping,
- threat model,
- SBOM generation,
- provenance/signing instructions,
- vulnerability disclosure policy,
- dependency audit workflow,
- secrets scanning,
- and incident response runbook.

**Deliverable:** `docs/security/assurance-package/`

---

### 6) Measure reliability instead of inferring it
Define SLOs and operational targets for the key journeys:

- public search,
- listing creation/editing,
- moderation,
- authentication,
- import/ingestion,
- and exports.

Then run:
- restore drills,
- load tests,
- failover/degradation exercises,
- and queue recovery tests.

**Deliverable:** `docs/reliability/slo-report.md`

---

### 7) Finish the open-source operating model
Add the missing trust documents and release artifacts.

**Minimum set:**
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `GOVERNANCE.md`
- `CODEOWNERS`
- release checklist
- signed releases
- SBOM
- reproducible build notes

**Deliverable:** an OSS onboarding path that a stranger can follow without maintainer help.

---

## Medium-priority actions

### 8) Define data lifecycle and residency
Add a retention matrix for all major data classes:

- transactional records,
- audit events,
- logs,
- exports,
- uploads,
- analytics,
- and deleted data tombstones.

Include legal-hold behavior and regional residency assumptions.

---

### 9) Publish an API contract and compatibility policy
Add OpenAPI generation, versioning rules, webhook specifications, and deprecation policy.

This will help both enterprise buyers and integrators trust the platform.

---

### 10) Strengthen search and ingestion governance
Add:

- search freshness SLOs,
- reindex playbooks,
- connector licensing tracking,
- provenance visibility,
- quarantine/replay tooling,
- and relevance evaluation.

---

### 11) Complete accessibility evidence
Move from smoke coverage to a real accessibility assurance program:

- manual keyboard and screen-reader testing,
- WCAG 2.2 AA mapping,
- accessible auth and error states,
- and a conformance report where appropriate.

---

## Strategic recommendation

Do **not** split into microservices yet. First, convert the current design into a measurable, evidence-backed platform. If decomposition later becomes necessary, it should be because the product has proven independent scaling or ownership requirements—not because architecture fashion

_…response truncated._

---

# Model: Claude Sonnet 5 (1M ctx)

## Summary

## Executive Summary

Enterprise readiness is not a feature checklist — it is the demonstrated ability to prove a product is **secure, reliable, governable, supportable, deployable in controlled environments, and usable at scale**. For an open-source project, there is a second requirement layered on top: those same guarantees must be **understandable and reproducible by a community that does not share the maintainer's infrastructure**.

### What already exists
The repository shows a strong engineering foundation:
- A **Next.js modular monolith** with strict TypeScript module boundaries.
- **Supabase/PostgreSQL** as the production authority, with Row-Level Security (RLS), normalized entities, audit events, idempotency keys, and outbox patterns.
- **Typesense** as a rebuildable, derived search index (not a source of truth).
- A **mock mode** with synthetic Houston rental inventory requiring no paid credentials — good for onboarding and OSS reproducibility.
- **Zod** input validation, server-side authorization intent, rate-limit ports, security headers, signed uploads/webhooks, and documented backup/rollback runbooks.
- Domain-specific guardrails for **trust, provenance, freshness, duplicate detection, fee transparency, and fair-housing** compliance.
- **Vitest, Playwright, accessibility smoke tests**, linting, typechecking, and production build gates in CI.

### What is missing
The project cannot yet be called enterprise-ready on documentation alone. The largest gaps are **evidence gaps** (things described but not tested/measured) and a **product-boundary gap** (an unresolved identity conflict between a rental marketplace product and a legacy text-editor implementation plan). Enterprise procurement and credible open-source positioning both require this to be resolved before further investment.

Critically absent: proof of tenant isolation, measured recovery objectives (RTO/RPO), load/capacity testing, upgrade/migration safety, enterprise identity and lifecycle management (SSO/SCIM), data-subject request workflows, dependency/supply-chain provenance (SBOM, signing), a support/SLA matrix, and a reproducible deployment story.

### Scope and evidence rules
This analysis is based on repository documents and package metadata as of 2026-08-18 (README, ARCHITECTURE, DATA_MODEL, SECURITY, IMPLEMENTATION_PLAN, docs/API, docs/DEPLOYMENT, docs/SECURITY_OPERATIONS, docs/ACCESSIBILITY_TESTING, package.json, migrations/tests).

A capability is **documented** if the repo describes it, but only **verified** once tests, configuration inspection, a deployment exercise, or an independent assessment confirms it. Enterprise claims should rely only on the verified category. This report is engineering research, **not legal, tax, housing, accessibility, privacy, or audit advice** — regulated claims require counsel and qualified assessors.

### Working definition of "enterprise" for this project
Enterprise-level means: trust and explainability, strong security and tenant isolation, defined resilience (availability/RTO/RPO), governance (org admin, roles, retention, legal holds), stable integration surfaces (APIs, SSO, webhooks, observability), operability (metrics/traces/runbooks), accessibility and fair-housing controls, and open-source sustainability (governance, reproducible releases, disclosure process, licensing clarity). It does **not** require microservices, every certification, or every workflow on day one — it requires explicit boundaries, measurable guarantees, and a credible path from default install to controlled production.

---

## Key Findings

## Strengths vs. Gaps by Area

| Area | Current Evidence | Gap / Opportunity | Priority |
|---|---|---|---|
| Architecture | Modular monolith, typed provider ports, authoritative PostgreSQL, derived search index | No documented scale envelope, isolation model, or dependency failure budget | P0 |
| Authorization | Server sessions, role checks, RLS described | Needs integration tests proving cross-tenant/role isolation; browser claims must never drive decisions | P0 |
| Auditability | Immutable audit events described for consequential actions | Needs event schema, retention rules, actor/session/request correlation, export, tamper-evidence review | P0 |
| Security | Zod, headers, rate limits, signed uploads/webhooks, redaction | Needs ASVS coverage, refreshed threat model, pen testing, SBOM/dependency policy, disclosure process | P0 |
| Reliability | Health/readiness endpoints, PITR recommendation, rollback runbook | Needs measured RTO/RPO, restore drills, SLOs, dependency timeouts, queue recovery, capacity tests | P0 |
| Data governance | Data minimization, export/deletion documented | Needs retention matrix, deletion proof, legal-hold behavior, residency options, processor inventory | P1 |
| Identity | Supabase Auth + MFA recommendation | Needs enterprise SSO (SAML/OIDC), domain verification, SCIM/lifecycle, session policy, break-glass admin | P0 |
| APIs | Consistent envelopes, pagination, idempotency guidance | Needs versioning, OpenAPI spec, quotas, webhook catalog, compatibility policy, API key model | P1 |
| Search | Outbox-fed Typesense with Postgres fallback | Needs lag/error SLOs, reindex capacity, zero-downtime schema migration, tenant filtering, relevance evaluation | P1 |
| Ingestion | Provenance, source records, import validation, licensed adapter boundary | Needs connector SDK, license register, freshness contracts, backpressure, quarantine, replay tooling | P1 |
| Accessibility | Accessibility smoke tests, keyboard/reduced-motion intent | Needs full WCAG 2.2 AA audit, AT/screen-reader testing, VPAT/ACR, accessible authentication | P1 |
| Compliance | Security/ops runbooks exist | No control matrix, evidence owner, audit cadence, or independent attestation | P1 |
| Open source | Docs and mock mode are promising | Needs LICENSE, CONTRIBUTING, CODEOWNERS, governance, release policy, SBOM, signing, support matrix, security.txt | P0 |
| Product clarity | Marketplace routes/domain model are extensive | Implementation plan still describes a text editor — scope conflict must be resolved | P0 |

## Findings by Research Track

**Product identity & tenancy:** The data model includes organizations and provider accounts, but there is no explicit contract for tenant boundaries, shared inventory, cross-org administration, or data residency. This is the controlling decision for RLS design, cache/index keys, exports, analytics, and support access — and it is currently undefined.

**Identity & lifecycle:** Supabase Auth and MFA recommendations exist, but there is no enterprise federation (SAML/OIDC), no automated provisioning/deprovisioning (SCIM), and no documented support-safe administrative access model or break-glass procedure.

**Security & privacy:** Strong baseline controls exist (validation, RLS, rate limiting, CSP/headers, signed uploads, malware scanning adapters, signed webhooks, redaction, fair-housing constraints), but there is no ASVS requirement-to-test matrix, no formal data inventory/processing register, no published vulnerability disclosure policy, no dependency patch SLA, and no evidence of SBOM generation, artifact signing, or independent penetration testing.

**Reliability & DR:** Runbooks recommend PITR and restore drills, but there are no measured RTO/RPO figures, no load-test baselines, no SLO dashboards, and no documented dependency failure budget for Supabase, Typesense, QStash, storage, email, or geocoding outages.

**Data/search/ingestion quality:** The properties → buildings → units → listings → source-records hierarchy is a strong lineage foundation, but source licensing, canonical duplicate resolution, freshness contracts, and search relevance/fairness monitoring are not yet formalized as operational products.

**API/integration platform:** Good envelope and idempotency conventions exist, but there is no OpenAPI contract, compatibility/versioning policy, webhook catalog, or API key/service-account lifecycle model.

**Operations & support:** Sentry/PostHog adapters and health/readiness endpoints are documented, but dashboards, alerting, escalation, retention ownership, and customer-facing incident communication are undefined.

**Accessibility & housing safety:** Fair-housing guardrails, provider-reported labeling, and accessibility smoke tests are real strengths, but full WCAG 2.2 AA conformance (with assistive-technology testing), a jurisdiction rules registry, and fully keyboard/screen-reader-accessible map interactions remain undone.

**Open-source governance:** No LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.md, SUPPORT.md, GOVERNANCE.md, CODEOWNERS, or release/versioning policy is confirmed present — this is a P0 blocker for any credible open-source or enterprise trust claim.

---

## Comparisons

## Architectural Trade-offs

### Modular Monolith vs. Microservices
| Dimension | Modular Monolith (current) | Microservices (future option) |
|---|---|---|
| Operational complexity | Low–moderate; single deployable | High; requires service mesh, distributed tracing, independent CI/CD |
| Enterprise fit today | Sufficient if boundaries (identity, authorization, data, job, provider, release

_…response truncated._

---

# Model: GPT-5.6 Luna

## Summary

## Executive assessment

The rental marketplace has a promising enterprise foundation, but it should not yet be marketed as fully enterprise-ready. Its strongest qualities are architectural coherence, documented security intent, domain-specific trust controls, local mock mode, and a pragmatic modular-monolith design.

The principal issue is not the absence of every possible enterprise feature. It is the absence of independently reproducible evidence for the most important claims. The project must demonstrate tenant isolation, recovery objectives, workload capacity, upgrade safety, identity lifecycle management, data governance, software-supply-chain integrity, and deployment reproducibility.

A second critical issue is product ambiguity. The repository presents a rental marketplace, while the implementation plan reportedly describes a legacy text editor. Before external positioning, procurement discussions, or major architectural investment, maintainers should publish a definitive product boundary and explain whether the editor is being retained, extracted, or deprecated.

### Overall recommendation

1. Resolve product identity, tenancy, and deployment-model decisions.
2. Preserve the modular monolith until measured scaling or ownership requirements justify decomposition.
3. Convert documented controls into automated tests, operational drills, and independently reviewable evidence.
4. Add enterprise identity, API, lifecycle, observability, and recovery capabilities in a provider-neutral way.
5. Productize the open-source project through licensing, governance, reproducible releases, security disclosure, and a clear support model.

The project should use labels such as **documented**, **implemented**, **automatically verified**, and **independently assessed** rather than making undifferentiated enterprise or compliance claims.

---

## Key Findings

## Existing strengths

- **Architecture:** A typed Next.js modular monolith with PostgreSQL/Supabase as the system of record and Typesense as a rebuildable derived index is an appropriate starting point for a marketplace.
- **Security foundations:** The repository describes Zod validation, server-side authorization, row-level security, security headers, rate limiting, signed uploads and webhooks, redaction, and replay protection.
- **Data integrity:** Normalized entities, provenance, source records, audit events, idempotency, and outbox concepts provide a credible foundation for trustworthy listing ingestion and publication.
- **Operational intent:** Health/readiness checks, backup guidance, rollback practices, provider adapters, and degraded-mode behavior are useful foundations for self-hosting.
- **Local usability:** Mock mode with synthetic Houston inventory and no paid credentials lowers contributor and evaluator friction.
- **Marketplace safeguards:** Fair-housing constraints, moderation concepts, freshness indicators, duplicate detection, fee transparency, and provider-reported labeling address risks specific to rental platforms.
- **Quality tooling:** Vitest, Playwright, accessibility smoke coverage, linting, typechecking, and production-build gates create a reasonable CI baseline.

## Highest-priority gaps

### 1. Tenant isolation and authorization evidence

Organizations and provider accounts are present conceptually, but the complete isolation contract is not sufficiently explicit. Isolation must cover database queries, APIs, search documents, object storage, caches, background jobs, exports, analytics, and support tooling. Cross-tenant negative tests are essential.

### 2. Product and deployment ambiguity

The rental marketplace and legacy text-editor descriptions create uncertainty about scope, customers, deployment assumptions, and repository ownership. This ambiguity can undermine security reviews, architecture decisions, and enterprise procurement.

### 3. Enterprise identity

Supabase Auth and MFA recommendations are not equivalent to enterprise SSO and lifecycle management. Target customers may require OIDC or SAML, verified domains, group-to-role mapping, SCIM or an equivalent provisioning API, session revocation, service accounts, and break-glass administration.

### 4. Reliability evidence

Backup and point-in-time recovery guidance do not establish a measured RPO or RTO. The project needs restore drills, load tests, dependency-failure tests, queue recovery, search rebuild exercises, migration compatibility tests, and SLO dashboards.

### 5. Security assurance and supply-chain controls

The repository needs an ASVS control matrix, threat-model reviews, dependency and secret scanning, license scanning, SBOMs, signed artifacts, build provenance, vulnerability-response targets, and ideally an independent penetration test before strong enterprise security claims are made.

### 6. Data governance and privacy

Documented minimization and export/deletion intent should be expanded into a data inventory, processor register, retention schedule, deletion verification, legal-hold behavior, regional-residency decisions, and customer-facing data-processing documentation.

### 7. API and integration maturity

The API has useful envelope and idempotency concepts, but enterprise adoption requires a published OpenAPI contract, versioning and deprecation rules, quotas, service-account/API-key lifecycle, signed webhooks, replay semantics, bulk exports, and typed SDK or CLI support.

### 8. Open-source sustainability

The project should publish an OSI-approved license, contribution and governance documents, a code of conduct, support policy, security contact, CODEOWNERS, release policy, compatibility matrix, signed releases, SBOMs, and a clear boundary between community support, hosted service, and paid assistance.

---

## Comparisons

## Current state versus enterprise target

| Capability | Current position | Enterprise target | Evidence required |
|---|---|---|---|
| Product scope | Marketplace implementation with legacy-editor ambiguity | One explicit product boundary and roadmap | Product decision record and updated public documentation |
| Tenancy | Organizations, memberships, and RLS are described | Explicit organization/resource-sharing model across all data paths | Authorization matrix and cross-tenant integration tests |
| Authentication | Supabase Auth boundary and MFA intent | OIDC/SAML SSO, domain verification, SCIM or lifecycle API, step-up authentication | Provider integration tests and deprovisioning measurements |
| Data authority | PostgreSQL is authoritative; search is derived | Rebuildable, tenant-safe, observable data pipeline | Rebuild drill, lineage documentation, freshness metrics |
| Reliability | PITR and rollback guidance | Measured SLOs, RTO/RPO, capacity envelope, graceful degradation | Load report, restore exercise, dashboards, incident drills |
| Security | Strong documented controls | Tested ASVS coverage and independent assessment | Control matrix, automated tests, penetration-test report |
| Releases | Application and migration guidance | Signed, traceable, reproducible releases with SBOMs | Provenance attestations, checksums, SBOM, clean-build instructions |
| APIs | Consistent envelopes and idempotency guidance | Versioned OpenAPI, quotas, webhooks, SDK/CLI, bulk jobs | CI-validated specification and compatibility tests |
| Accessibility | Smoke tests and accessibility intent | WCAG 2.2 AA target with manual assistive-technology coverage | Accessibility conformance report and remediation log |
| Open source | Good repository documentation and mock mode | Governed, licensed, supportable, reproducible community project | License, governance files, support matrix, release history |

## Architecture options

### Modular monolith

**Best default for the current phase.** It minimizes operational complexity, keeps transactions and authorization easier to reason about, and supports rapid iteration. It should be strengthened with explicit module ports, job boundaries, observability, and tenant-aware tests.

### Microservices

**Not currently justified by documentation alone.** Splitting services would add deployment, networking, data-consistency, tracing, and incident-response complexity. Consider decomposition only when a module requires independent scaling, isolation, deployment cadence, or ownership.

### Hosted-only service

Provides the strongest operational control and can simplify upgrades, telemetry, and support. However, it limits self-hosting, increases customer trust requirements, and may conflict with open-source positioning.

### Self-hosted distribution

Supports data sovereignty and regulated or infrastructure-sensitive customers, but requires reproducible deployment, upgrade/rollback procedures, dependency compatibility, observability, backup ownership, and a clear support matrix.

### Recommended operating model

Offer a hosted reference deployment plus a documented self-hosted distribution. Keep core domain behavior and security boundaries available in the open repository, while treating optional managed-service integrations as replaceable adapters rather than hidden prerequisites.

---

## Suggestions

## Priority roadmap

### Phase 0: decision and evidence reset — 0–4 weeks

- Resolve marketplace versus text-editor scope and update README, architecture, and implementation-plan language.
- Publish the tenancy, data-classification, retention, and deployment-model decisions.
- Create a role/resource/action authorization matrix.
- Add `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `SUPPORT.md`, and a vulnerability-disclosure policy.
- Inventory dependencies, processors, external providers, data sources, source licenses, secrets, and customer-facing claims.
- Map controls to NIST CSF 2.0 and OWASP ASVS 5.0.

**Exit criterion:** Product scope, supported deployment modes, and non-negotiable security boundaries are unambiguous.

### Phase 1: enterprise foundation — 1–3 months

- Add cross-tenant RLS and route-level negative tests.
- Implement the first OIDC or SAML adapter and define the second-protocol roadmap.
- Add step-up authentication, session/device administration, and service-account policy.
- Publish and CI-validate OpenAPI.
- Formalize audit events with actor, organization, target, reason, outcome, request ID, session ID, and timestamp.
- Add secret, dependency, license, and container scanning.
- Generate SBOMs and sign release artifacts with verifiable provenance.
- Define SLOs, dashboards, alerts, redaction rules, and telemetry retention.
- Run production-sized load tests and a complete backup-restore exercise.

**Exit criterion:** A reviewer can reproduce the security baseline, an operator can diagnose common failures, and a customer can integrate identity and APIs.

### Phase 2: scale and governance — 3–6 months

- Add SCIM or a documented provisioning/deprovisioning API.
- Implement connector contracts, quarantine/replay workflows, freshness metrics, and data-quality rules.
- Version search schemas and ranking policies; evaluate relevance using a labeled query set.
- Add tenant-aware asynchronous exports and customer-managed signed webhooks.
- Complete manual accessibility testing with keyboard and screen-reader workflows.
- Implement retention, deletion verification, legal holds, and export evidence.
- Test zero-downtime migrations and provider degradation at scale.

### Phase 3: independent assurance and ecosystem — 6–12 months

- Commission an independent penetration test.
- Prepare SOC 2 readiness evidence and evaluate whether ISO/IEC 27001 certification is commercially justified.
- Publish an accessibility conformance report or VPAT where appropriate.
- Add regional deployment or residency options if validated by customer demand.
- Establish an LTS policy, release train, maintainer succession plan, public roadmap, and quarterly recovery exercises.

## Recommended acceptance tests

- Attempt unauthorized reads and writes through UI, API, search, storage, exports, jobs, analytics, and operator tools.
- Disable Typesense, storage, email, geocoding, queue, and observability providers and verify safe degradation.
- Restore a production-sized database into a clean environment and rebuild derived indexes.
- Run migrations across old and new application versions to verify compatibility and rollback behavior.
- Revoke a user's identity-provider access and measure the maximum time until all application access is removed.
- Reproduce a release from source and verify its checksum, SBOM, and provenance.
- Test listing freshness, duplicate detection, fee calculations, moderation gates, provenance display, and correction/takedown paths.
- Test map and list workflows with keyboard-only navigation, screen readers, zoom/reflow, reduced motion, and accessible authentication.

## Metrics to establish

- Availability and latency by critical user journey.
- RTO, RPO, restore success, queue lag, failed-job replay rate, and search freshness.
- Cross-tenant authorization-test coverage and privileged-action audit coverage.
- Vulnerabilities beyond remediation SLA, secret-rotation time, MFA adoption, and incident response time.
- Stale-listing rate, provenance completeness, duplicate-review rate, import rejection rate, and takedown response time.
- Clean-install success, time to first local demo, rollback duration, release lead time, documentation freshness, and external contributor health.

---

## Further Reading

## Standards and guidance

- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework) — cybersecurity risk-management outcomes and organizational profiles.
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/) — testable web-application security requirements.
- [ISO/IEC 27001](https://www.iso.org/standard/27001) — information-security management-system requirements.
- [AICPA SOC resources](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) — service-organization assurance context.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — accessibility success criteria for web content and applications.
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework) — privacy-risk identification and management.
- [SLSA](https://slsa.dev/spec/v1.2/) — software-supply-chain provenance and integrity guidance; confirm the current specification before implementation.
- [OpenSSF Best Practices](https://www.bestpractices.dev/en) — open-source security and maintenance practices.
- [Open Policy Agent](https://www.openpolicyagent.org/docs/latest/) — an option for versioned, decoupled policy decisions where policy complexity warrants it.

## Suggested repository documents

- `docs/PRODUCT_BOUNDARY.md` — definitive product identity, personas, and non-goals.
- `docs/TENANCY.md` — organization boundaries, public/private data, sharing, support access, and residency.
- `docs/CONTROL_MATRIX.md` — mapped controls, owners, implementation status, and evidence links.
- `docs/RELIABILITY.md` — SLOs, SLI definitions, RTO/RPO, capacity assumptions, and dependency behavior.
- `docs/IDENTITY.md` — SSO, MFA, SCIM, service accounts, session policy, and break-glass procedures.
- `docs/RELEASES.md` — versioning, migration compatibility, signing, SBOMs, provenance, and rollback.
- `docs/DATA_GOVERNANCE.md` — inventory, processors, retention, deletion, legal holds, exports, and residency.
- `docs/SUPPORT.md` — community, standard, and enterprise support boundaries and response targets.

---

# Model Failure: GPT-5.6

API error 400: {"llmService":null,"message":"Deployment of \"gpt-5.6\" for \"ChatCompletions\" is not found!"}

---

# Model Failure: GPT-5.6 Sol

gpt-5.6-sol returned no text: the output token budget was used up before any answer was produced (finish_reason=length). Raise Max Tokens in Settings.

---

# Model Failure: Claude Opus 5 (1M ctx)

Claude-Opus-5 returned an empty response (stop_reason=max_tokens).

---

# Reconciled Multi-Model Research

# Enterprise Readiness and Open-Source Research Report
**Project:** Rental Marketplace (with legacy text-editor lineage)  
**Prepared:** 2026-08-18  
**Status:** Research baseline and upgrade backlog  
**Audience:** Maintainers, contributors, security reviewers, operators, and organizations evaluating self-hosting

---

## Executive Summary

The repository shows a **strong architectural and engineering foundation**, but the available evidence does **not yet justify an enterprise-ready claim**.

Across the briefs, there is strong agreement on the current strengths:

- **Next.js modular monolith** with strict TypeScript boundaries.
- **Supabase/PostgreSQL** as the authoritative store, with RLS, normalized entities, audit-event concepts, idempotency, and outbox patterns.
- **Typesense** as a rebuildable **derived** search index rather than a system of record.
- **Mock mode** with synthetic Houston inventory and no paid credentials required.
- **Security-oriented implementation intent**, including Zod validation, server-side authorization intent, rate-limit ports, security headers, signed uploads/webhooks, and documented backup/rollback practices.
- **Domain-specific trust controls**, including provenance, freshness, duplicate handling, fee transparency, and fair-housing guardrails.
- **Quality gates** including Vitest, Playwright, accessibility smoke tests, linting, typechecking, and production build checks.

Across the models, the main blockers are also consistent:

1. **Product identity conflict**  
   Repository materials present a rental marketplace, while the implementation plan still references a text-editor lineage. This creates ambiguity in roadmap, scope, compliance posture, and buyer expectations.

2. **Evidence gaps in core enterprise claims**  
   Important controls appear to be documented, but not yet proven by automated tests, exercises, or external assessment.

3. **Tenant isolation is not yet demonstrably proven**  
   RLS and organization concepts are present, but there is not yet clear evidence of isolation across API routes, search, storage, jobs, exports, analytics, and support/admin tooling.

4. **Identity lifecycle is incomplete**  
   Supabase Auth and MFA guidance are not enough for enterprise expectations around SSO, provisioning/deprovisioning, session control, and privileged access.

5. **Recovery, scale, and upgrade safety are not yet measured**  
   Restore drills, RTO/RPO, SLOs, capacity envelopes, and migration compatibility need evidence.

6. **Open-source operating model is incomplete or unverified**  
   Multiple briefs highlight likely gaps or unverified presence of license, governance, contribution policy, support policy, signed releases, SBOM/provenance, and reproducible release practices.

### Recommended strategic posture

- **Keep the modular monolith** and harden boundaries before considering decomposition.
- **Resolve product identity immediately**.
- **Convert documented intent into verifiable evidence**.
- **Support both hosted and self-hosted modes** only if there is a clear support matrix and deployment story.
- **Treat compliance as an evidence program**, not a marketing label.

---

## Scope and Evidence Rules

This synthesis is based on repository documentation and package metadata referenced in the source briefs, including:

- `README.md`
- `ARCHITECTURE.md`
- `DATA_MODEL.md`
- `SECURITY.md`
- `IMPLEMENTATION_PLAN.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY_OPERATIONS.md`
- `docs/ACCESSIBILITY_TESTING.md`
- `package.json`
- migration and test trees

### Evidence standard used throughout

A capability is:

- **Documented** if the repository describes it.
- **Verified** only if supported by tests, deployment exercises, configuration inspection, operational drills, or independent assessment.

All source models agreed on this distinction. Any enterprise-facing claim should be grounded in the **verified** category.

### Important limitation

This is an engineering research report, not legal, privacy, housing, accessibility, tax, or audit advice. Regulated or jurisdiction-specific claims require qualified counsel and assessors.

---

## Working Definition of Enterprise Readiness

For this project, enterprise-ready should mean the product can demonstrate:

- **Trust:** explainable provenance, moderation, ranking, pricing, and auditability.
- **Security:** strong identity, authorization, tenant isolation, secure defaults, and vulnerability response.
- **Resilience:** defined availability, RTO, RPO, graceful degradation, and tested restoration.
- **Governance:** organization administration, delegated roles, approvals, retention, legal hold, and change control.
- **Integration:** stable APIs, webhooks, SSO, lifecycle automation, exports, and observability hooks.
- **Operability:** metrics, traces, structured logs, dashboards, alerts, runbooks, and safe migrations.
- **Accessibility and inclusion:** WCAG 2.2 AA target with human testing, plus fair-housing safeguards.
- **Open-source sustainability:** clear licensing, governance, reproducible releases, disclosure process, and contributor-safe workflows.

All briefs also agreed on a negative definition: enterprise readiness does **not** require microservices or every certification up front. It requires **explicit boundaries, measurable guarantees, and a credible operating model**.

---

## Areas of Strong Agreement

## 1. Architecture is a strength, but proof is missing

There is strong alignment that the **modular monolith** is the right current architecture.

### What appears strong
- Single deployable with typed boundaries.
- PostgreSQL as authority; search is derived.
- Outbox/idempotency concepts exist.
- External providers are abstracted enough to be mocked or replaced.

### What is missing
- Documented scale envelope.
- Measured failure behavior under dependency degradation.
- Explicit tenant/isolation model.
- Compatibility rules for migrations, versions, and search schema evolution.

### Editorial conclusion
The architecture is **appropriate for enterprise hardening**, but not yet enterprise-proven.

---

## 2. Tenant isolation is the top technical enterprise risk

Every substantive brief identified **tenant isolation** as the highest-priority technical proof gap.

### What is documented
- Organizations and roles exist conceptually.
- RLS is described.
- Server-side authorization intent is present.

### What must be proven
Isolation across:

- UI behavior
- API routes
- database policies
- search results and filters
- object storage/media access
- background jobs
- exports
- analytics
- support/admin tooling

### Recommended evidence
- Role-resource-action matrix
- Threat model covering browser, API, worker, DB, search, storage, and operator paths
- Cross-tenant negative tests
- Explicit treatment of shared public listings vs organization-private/provider-private data

### Editorial conclusion
RLS should be treated as **one control layer**, not the whole authorization story.

---

## 3. Identity and lifecycle management are not yet enterprise-complete

All major briefs agree that current auth guidance is insufficient for enterprise buyers.

### Likely missing or underdefined
- OIDC and/or SAML SSO
- Domain verification
- Group-to-role mapping
- SCIM 2.0 or equivalent lifecycle API
- Session/device visibility and revocation
- Step-up authentication for privileged actions
- Service accounts/API identities
- Break-glass administration

### Recommended direction
Introduce identity behind a provider abstraction so local/mock development remains usable while enterprise federation becomes pluggable.

### Editorial conclusion
Without identity lifecycle controls, safe onboarding/offboarding and access governance remain incomplete.

---

## 4. Security intent is good, but assurance artifacts are missing

All briefs describe a good baseline of security-oriented design, but not enough proof for strong enterprise claims.

### Documented strengths
- Zod validation
- server-side auth intent
- rate limiting
- headers/CSP intent
- signed uploads and webhooks
- redaction/minimization guidance
- fair-housing-related guardrails
- malware scanning adapters were mentioned in some briefs

### Commonly identified gaps
- No visible ASVS mapping
- No formal threat-model refresh with tracked findings
- No published or verified vulnerability disclosure workflow in the reviewed evidence
- No dependency patch SLA or severity rubric
- No SBOM/release provenance/signing evidence
- No clear secret scanning / dependency scanning / license scanning evidence
- No independent penetration test
- No documented key rotation ownership model
- No explicit negative tests for race conditions, search bypass, webhook SSRF, or cache poisoning

### Editorial conclusion
Security appears **well considered**, but not yet **assurance-ready**.

---

## 5. Reliability and disaster recovery are under-evidenced

All models agree this is a major gap.

### What exists
- Health/readiness concepts
- backup guidance
- PITR recommendations
- rollback documentation

### What is needed
- Measured RTO and RPO
- Restore drills
- SLOs/SLIs and error budgets
- Capacity/load testing
- Queue poison-message handling
- Search rebuild exercises
- Dependency failure behavior
- Zero-downtime migration compatibility testing

### Suggested initial targets from multiple briefs
These were consistently framed as **targets to validate**, not promises:

- Public search availability: **99.9% monthly**
- Critical write availability: **99.9% monthly**
- Search p95 latency: **under 500 ms** at agreed load
- Search freshness: **99% of successful writes indexed within 5 minutes**
- RPO: **15 minutes or better**
- RTO: **4 hours or better**

### Editorial conclusion
Reliability is currently **documented intent plus runbook guidance**, not measured assurance.

---

## 6. Data governance is conceptually present, but operationally incomplete

The source briefs consistently describe a good conceptual start on privacy/data governance, but with missing operational detail.

### Documented or implied strengths
- Minimization intent
- export/deletion concepts
- provenance and source record awareness

### Likely missing
- Data inventory / processing register
- Retention matrix
- Deletion proof
- Legal hold behavior
- Processor inventory
- Data classification by sensitivity and purpose
- Residency/region options or explicit non-support statement

### Editorial conclusion
This is not yet a procurement-grade data governance story.

---

## 7. Search and ingestion design are promising, but need enterprise controls

There is broad agreement that the underlying approach is sound.

### Strengths
- Search is derived, not authoritative.
- Source records and lineage concepts appear strong.
- Import validation and adapter boundaries exist.

### Needed next steps
- Search freshness and lag SLOs
- Zero-downtime reindex strategy
- Tenant-safe filtering guarantees
- Search schema and ranking versioning
- Connector SDK or contracts
- Source license/terms register
- Freshness contracts
- Quarantine and replay tooling
- Relevance evaluation
- Partitioning of public vs private documents to prevent leakage

### Editorial conclusion
The design is credible, but operational rigor is still needed.

---

## 8. Accessibility and fair-housing controls are meaningful strengths

This was one of the more positive areas across the briefs.

### Current strengths
- Accessibility smoke tests
- keyboard and reduced-motion intent
- fair-housing guardrails
- rejection of protected-class ranking criteria was specifically noted in one brief
- provider-reported labeling and complaint/reporting paths were recommended

### Remaining work
- Full WCAG 2.2 AA audit scope
- Manual screen-reader testing
- Accessible authentication and error recovery
- VPAT/ACR-style evidence where required
- Keyboard/screen-reader complete map alternatives
- Localization/internationalization architecture before broader geographic expansion
- Jurisdiction rules registry with owners, tests, and effective dates

### Editorial conclusion
This area is ahead of many early-stage projects in intent, but not yet fully evidenced.

---

## 9. Open-source productization is a major gap

All substantive briefs stressed this point.

### Commonly cited missing or unverified items
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md` or stronger security contact/disclosure details
- `SUPPORT.md`
- `GOVERNANCE.md`
- `CODEOWNERS`
- release policy
- compatibility matrix
- SBOM
- signed releases
- provenance/reproducibility guidance
- clear boundary between community support, hosted service, and paid support

### Editorial conclusion
The repository may be source-available in practice, but it does not yet appear to have a fully productized open-source trust layer.

---

## Material Disagreements or Uncertainties

There was **high overlap** across the usable briefs, with few direct contradictions. The main uncertainties are below.

### 1. Presence vs absence of some governance/security files
Some briefs speak in terms of “need” or “not visible,” while others imply certain files may already exist in some form.

**Trustworthy synthesis:**  
The evidence reviewed is insufficient to confirm a complete and enterprise-credible open-source governance package. Even if some files exist, the briefs agree that the overall package is incomplete or unverified.

### 2. Malware scanning adapters
One brief explicitly mentions malware scanning adapters; others do not.

**Trustworthy synthesis:**  
Treat malware scanning support as **possible documented intent**, not a verified repository-wide capability, unless directly confirmed.

### 3. Hosted vs self-hosted recommendation strength
Some briefs strongly recommend offering both hosted and self-hosted modes; others frame this as conditional on a support matrix and reproducible operations.

**Trustworthy synthesis:**  
A dual-mode strategy is reasonable, but should only be claimed if deployment reproducibility, support boundaries, and compatibility expectations are explicit.

### 4. Specific compliance framing
Several standards are consistently recommended—NIST CSF 2.0, OWASP ASVS, WCAG 2.2 AA, NIST Privacy Framework, SOC 2 readiness, ISO 27001 alignment—but no brief claims current compliance.

**Trustworthy synthesis:**  
These should be used as **control-mapping anchors**, not as claims of certification or compliance.

---

## Recommended Target Architecture

The consensus recommendation is to **retain the modular monolith** until measurement demonstrates a real need for service decomposition.

### Suggested boundary model

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

### Boundaries to make explicit
- **Identity boundary:** users, orgs, memberships, roles, SSO claims, service accounts
- **Authorization boundary:** server-side policy independent of UI
- **Data boundary:** public, tenant-owned, derived, sensitive, audit
- **Job boundary:** signed, idempotent, observable, retryable jobs
- **Provider boundary:** all external providers replaceable and mockable
- **Release boundary:** app version, migration version, search schema version, adapter compatibility
- **Policy boundary:** moderation, privacy, housing, and jurisdiction rules are versioned and explainable

### Architectural conclusion
Do **not** decompose into microservices yet. Multiple briefs explicitly warned that doing so too early would increase operational complexity without solving the current enterprise blockers.

---

## Prioritized Roadmap

## Phase 0 — Decision and evidence reset (0–4 weeks)

### Priorities
- Resolve rental marketplace vs text-editor product identity.
- Publish the tenancy and deployment model.
- Add or complete core OSS trust docs:
  - `LICENSE`
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `GOVERNANCE.md`
  - `SUPPORT.md`
  - vulnerability disclosure/security contact
  - `CODEOWNERS`
- Build role-resource-action authorization matrix.
- Build data classification and retention matrix.
- Inventory dependencies, processors, source licenses, external providers, secrets, and customer-facing claims.
- Start control/evidence register mapped to NIST CSF 2.0 and OWASP ASVS.

### Exit criterion
Product scope, supported deployment modes, and non-negotiable security boundaries are unambiguous.

---

## Phase 1 — Enterprise foundation (1–3 months)

### Priorities
- Add cross-tenant/RLS integration tests and privileged-route negative tests.
- Decide and implement first enterprise SSO path (OIDC or SAML).
- Define session/device administration, step-up auth, and service-account model.
- Publish and CI-validate OpenAPI.
- Formalize audit event schema and correlation fields.
- Add dependency, secret, and license scanning.
- Generate SBOMs and sign release artifacts with provenance.
- Define SLOs, dashboards, alerts, telemetry redaction rules, and retention defaults.
- Run load tests and a full restore drill.

### Exit criterion
A reviewer can reproduce the security baseline, an operator can diagnose common failures, and a customer can integrate identity and APIs.

---

## Phase 2 — Scale and governance (3–6 months)

### Priorities
- Add SCIM or lifecycle API.
- Add connector contracts/SDK, quarantine and replay workflows, freshness metrics, and data-quality checks.
- Version search schemas and ranking rules; evaluate relevance.
- Add tenant-aware async exports and customer-managed webhooks.
- Complete manual accessibility testing.
- Implement retention, deletion verification, legal hold, and export evidence.
- Test zero-downtime migrations and degraded dependency behavior at scale.

### Exit criterion
Measured capacity envelope, repeatable recovery, controllable data lifecycle, and stable integration contracts.

---

## Phase 3 — Assurance and ecosystem (6–12 months)

### Priorities
- Commission independent penetration test.
- Prepare SOC 2 readiness evidence.
- Evaluate whether ISO/IEC 27001 certification is commercially justified.
- Publish accessibility conformance report / VPAT where appropriate.
- Add regional deployment/residency options if justified by customer demand.
- Establish release train, LTS policy, community health metrics, and succession planning.
- Run recurring incident and recovery exercises.

### Exit criterion
Enterprise claims are backed by current evidence rather than roadmap intent.

---

## High-Priority Investigation Backlog

| ID | Question | Deliverable | Priority |
|---|---|---|---|
| ER-001 | What is the single product identity and supported use case? | Product boundary ADR | P0 |
| ER-002 | What is the tenant, sharing, and residency model? | Tenancy ADR and authorization matrix | P0 |
| ER-003 | Can one organization access another organization’s records through any path? | RLS and route isolation test suite | P0 |
| ER-004 | What are RTO, RPO, SLO, and capacity targets? | Reliability targets and load-test report | P0 |
| ER-005 | What identity integrations do target buyers require? | SSO/SCIM decision and provider contract | P0 |
| ER-006 | Which controls map to ASVS 5.0 and NIST CSF 2.0? | Control/evidence matrix | P0 |
| ER-007 | Can a clean machine reproduce a release and verify provenance? | Release reproducibility report | P0 |
| ER-008 | What data is collected, why, where, and for how long? | Data inventory and retention schedule | P1 |
| ER-009 | What is the API compatibility and webhook contract? | OpenAPI, versioning, and webhook specification | P1 |
| ER-010 | What source-license and data-quality obligations apply to connectors? | Connector register and ingestion policy | P1 |
| ER-011 | Does the complete workflow meet WCAG 2.2 AA with assistive technology? | Accessibility report and remediation plan | P1 |
|

---

# Development Plan

# Development Plan: Enterprise Readiness for the Rental Marketplace

## Overview

This plan focuses on turning the existing **Rental Marketplace modular monolith** into a product that is not just well-designed, but **enterprise-verifiable** and **open-source-operable**.

Based on the research, the repository already has strong foundations: a **Next.js + TypeScript modular monolith**, **Supabase/PostgreSQL** as the system of record, **Typesense** as a rebuildable derived index, strong validation patterns, mock mode, and documented security/reliability intent. However, the largest blockers to enterprise readiness are not missing product ideas—they are **evidence gaps and boundary gaps**.

The plan therefore prioritizes:

1. **Resolving product identity conflict** between the rental marketplace and the legacy text-editor lineage.
2. **Defining tenancy, deployment, and authorization boundaries** before expanding features.
3. **Producing verifiable evidence** for security, isolation, reliability, and operational behavior.
4. **Adding enterprise identity, lifecycle, API, and governance capabilities** in a way that preserves the current modular monolith.
5. **Productizing the open-source operating model** with licensing, governance, reproducible releases, SBOM/provenance, and support expectations.

### Reconciled recommendation

The model briefs are aligned on the strategic direction: **do not split into microservices yet**. Harden and prove the existing monolith first. Also, **retain the rental marketplace as the primary product** only if that is the intentional direction; otherwise explicitly split or archive the text-editor lineage. This decision is prerequisite to any enterprise positioning.

---

## Architecture

## High-level architecture decision

Per the research, the recommended architecture is to **keep the modular monolith** and make its boundaries explicit and testable before considering decomposition.

### Target architecture

```text
Web UI / API Routes
  -> Authentication & Authorization layer
  -> Domain Services
      -> PostgreSQL / Supabase (system of record, RLS)
      -> Outbox + Idempotent Workers
      -> Search Adapter (Typesense)
      -> Object Storage Adapter
      -> Notification Adapter (email/webhooks)
      -> Observability Adapter
      -> Audit Adapter
  -> Policy / Jurisdiction Rules
  -> Integration Layer (OpenAPI, webhooks, exports, lifecycle APIs)
```

## Key components

### 1. Web + API layer
- **Technology:** Next.js app router / server routes, TypeScript, Zod
- **Why:** Already present and suitable for a modular monolith. Research specifically recommends stabilizing route, auth, and policy boundaries before any decomposition.
- **Responsibility:** UI flows, API contracts, request validation, authentication entry points, request correlation, and orchestration.

### 2. Authorization and tenancy policy layer
- **Technology:** server-side policy module, role-resource-action matrix, database RLS as defense-in-depth
- **Why:** Research repeatedly identifies tenant isolation as the top enterprise risk. RLS alone is not sufficient explanation or assurance.
- **Responsibility:** evaluate organization membership, roles, sharing rules, public/private visibility, and privileged action requirements.

### 3. PostgreSQL / Supabase authority
- **Technology:** PostgreSQL with Supabase-managed capabilities, migrations, RLS, audit/event tables
- **Why:** Research confirms PostgreSQL should remain authoritative; Typesense must remain derived.
- **Responsibility:** authoritative transactional data, tenant ownership, audit events, identity linkage, export/deletion state, retention metadata.

### 4. Outbox + worker subsystem
- **Technology:** existing queue/outbox pattern, idempotent job execution, retry + dead-letter handling
- **Why:** Research highlights need for queue recovery, replay safety, observability, and job-level tenant isolation proof.
- **Responsibility:** indexing, imports, exports, notifications, webhook delivery, replay/rebuild tasks.

### 5. Search subsystem
- **Technology:** Typesense as derived index
- **Why:** Current design is sound per research, but needs lag/error SLOs, schema versioning, rebuild rehearsals, and tenant-safe filtering.
- **Responsibility:** public search, internal discovery, freshness tracking, relevance/version management.

### 6. Identity subsystem
- **Technology:** auth provider abstraction; start with Supabase Auth plus enterprise adapters for OIDC and optionally SAML
- **Why:** Research recommends enterprise identity behind a provider interface so local and mock development stay simple while enterprise federation becomes pluggable.
- **Responsibility:** login, MFA, SSO, session controls, step-up auth, service accounts, deprovisioning.

### 7. Integration layer
- **Technology:** OpenAPI-generated contracts, signed webhooks, lifecycle API/SCIM, async exports
- **Why:** Enterprise buyers expect stable APIs, explicit compatibility rules, and automation hooks.
- **Responsibility:** partner/customer integration, automation, data export, event delivery.

### 8. Observability and audit
- **Technology:** OpenTelemetry, structured logs, metrics, trace IDs, safe operator diagnostics
- **Why:** Research identifies major evidence gaps in diagnosability, SLOs, and audit correlation.
- **Responsibility:** metrics, logs, traces, dashboards, request/job/audit correlation, incident evidence.

### 9. Release and trust layer
- **Technology:** CI/CD, SBOM generation, artifact signing, provenance attestation, release compatibility docs
- **Why:** Open-source enterprise readiness depends on reproducibility and supply-chain trust, not just source availability.
- **Responsibility:** signed releases, verification, dependency scanning, secret scanning, license scanning, upgrade safety.

## Data flow

### Core write flow
1. User authenticates through local auth or enterprise SSO.
2. API route validates payload with Zod.
3. Authorization layer evaluates organization, role, policy, and step-up requirements.
4. PostgreSQL persists authoritative state.
5. Audit event is written with actor, org, request ID, target, outcome.
6. Outbox record is created in same transaction.
7. Worker processes outbox item idempotently.
8. Derived systems update:
   - Typesense index
   - webhook deliveries
   - notifications
   - analytics/telemetry
9. Observability records latency, success/failure, and correlation metadata.

### Search flow
1. Public or authenticated user queries search.
2. Search adapter enforces visibility and tenant-safe filtering.
3. Typesense returns derived results.
4. If search is degraded or unavailable, fallback paths are applied where feasible.
5. Trace/log metadata captures freshness lag and query outcome.

### Admin / sensitive action flow
1. User requests export, role change, moderation action, provider verification, or destructive action.
2. Step-up auth is enforced.
3. Policy layer verifies elevated authorization.
4. Immutable audit event is recorded.
5. Async job executes with tenant-scoped payload and replay-safe semantics.

---

## Milestones

## Milestone 1: Product Identity, Tenancy, and OSS Trust Baseline
Resolve scope ambiguity and establish the non-negotiable enterprise boundaries and governance package.

**Key deliverables**
- Product identity ADR
- Tenancy and deployment model ADR
- Role-resource-action matrix
- Data classification and retention matrix
- OSS trust docs: LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, GOVERNANCE, SUPPORT, CODEOWNERS, security disclosure details
- Initial control/evidence register mapped to NIST CSF 2.0 and OWASP ASVS 5.0

**Estimated complexity:** Medium

---

## Milestone 2: Isolation, Authorization, and Audit Evidence
Prove tenant isolation and privileged-route behavior with automated tests and structured auditability.

**Key deliverables**
- Cross-tenant/RLS integration test suite
- Search/storage/job/export isolation tests
- Server-side authorization policy module
- Structured audit event schema with correlation fields
- Threat model covering browser, API, workers, DB, search, storage, operator paths

**Estimated complexity:** High

---

## Milestone 3: Enterprise Identity and Integration Contract
Add enterprise identity lifecycle capabilities and formalize integration boundaries.

**Key deliverables**
- Auth provider abstraction
- OIDC integration first, SAML decision documented
- Step-up auth and session/device revocation
- Service account/API identity model
- OpenAPI contract generated and validated in CI
- API versioning/deprecation policy
- Signed webhook contract

**Estimated complexity:** High

---

## Milestone 4: Reliability, Observability, and Upgrade Safety
Move from documented runbooks to measurable operational evidence.

**Key deliverables**
- SLO/SLI definitions and dashboards
- Load test suite and performance baseline
- Restore drill report with measured RTO/RPO
- Queue retry/dead-letter/replay handling
- Dependency timeout/retry/circuit breaker policies
- Zero-downtime migration compatibility test strategy

**Estimated complexity:** High

---

## Milestone 5: Data Governance, Accessibility, and Open-Source Release Assurance
Complete procurement-grade governance, accessibility, and supply-chain trust foundations.

**Key deliverables**
- Data inventory, processor register, deletion/retention/legal hold implementation
- Manual accessibility test report and remediation backlog
- SBOM generation, artifact signing, provenance attestation
- Release reproducibility guide and compatibility matrix
- Support matrix for hosted vs self-hosted modes

**Estimated complexity:** Medium-High

---

## Task Breakdown

## Milestone 1: Product Identity, Tenancy, and OSS Trust Baseline

### 1.1 Create product identity ADR
- **Description:** Reconcile the README/implementation conflict and decide whether the product is the rental marketplace only, or whether the text-editor lineage remains a supported product line.
- **Dependencies:** None
- **Acceptance criteria:**
  - ADR approved by maintainers
  - README, docs, roadmap, and implementation plan use one consistent product identity
  - Any deprecated lineage is archived, split, or explicitly marked unsupported

### 1.2 Define supported deployment modes
- **Description:** Document whether the product supports hosted, self-hosted, or both, and define what is supported in each mode.
- **Dependencies:** 1.1
- **Acceptance criteria:**
  - Deployment model ADR published
  - Reference topology documented
  - Self-hosted support boundaries and operator responsibilities explicitly stated

### 1.3 Define tenancy model ADR
- **Description:** Specify unit of tenancy, public/shared/private data rules, residency expectations, and how organizations/provider accounts interact.
- **Dependencies:** 1.1
- **Acceptance criteria:**
  - Tenancy ADR published
  - Every tenant-owned entity category mapped to `organization_id` or explicit non-tenant/shared rule
  - Public vs organization-private vs user-private data rules documented

### 1.4 Create role-resource-action authorization matrix
- **Description:** Build the deny-by-default matrix for all roles and major resources/actions.
- **Dependencies:** 1.3
- **Acceptance criteria:**
  - Matrix stored in version control
  - Covers web, API, search, export, storage, moderation, and admin actions
  - Approved by engineering and product/security reviewers

### 1.5 Create data classification and retention matrix
- **Description:** Catalog data classes, sensitivity, purpose, retention, deletion requirements, and legal hold applicability.
- **Dependencies:** 1.3
- **Acceptance criteria:**
  - Data matrix published
  - Includes transactional, audit, search-derived, media, auth/session, and import source data
  - Each class has owner, retention rule, and deletion behavior

### 1.6 Add OSS trust/governance files
- **Description:** Add or complete LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, GOVERNANCE, SUPPORT, CODEOWNERS, and security disclosure information.
- **Dependencies:** 1.1
- **Acceptance criteria:**
  - Files present in repository root or docs
  - Support and security disclosure paths are explicit
  - Branch/review ownership is documented

### 1.7 Build initial control/evidence register
- **Description:** Map current and planned controls to NIST CSF 2.0 and OWASP ASVS 5.0, distinguishing documented vs verified evidence.
- **Dependencies:** 1.4, 1.5
- **Acceptance criteria:**
  - Register exists in version control
  - Each control has owner, evidence source, and status
  - P0 enterprise claims have identified evidence gaps

---

## Milestone 2: Isolation, Authorization, and Audit Evidence

### 2.1 Implement centralized server-side authorization policy module
- **Description:** Consolidate authorization logic so UI/browser claims cannot directly determine access decisions.
- **Dependencies:** 1.3, 1.4
- **Acceptance criteria:**
  - Protected routes call shared authorization layer
  - Policy layer supports org membership, role checks, sharing rules, and step-up requirements
  - Browser-only claims are not trusted for access decisions

### 2.2 Add cross-tenant API isolation tests
- **Description:** Create integration tests attempting unauthorized reads/writes across organizations.
- **Dependencies:** 2.1
- **Acceptance criteria:**
  - Tests cover create/read/update/delete and export attempts
  - Tests fail on any cross-organization access path
  - CI blocks merge on regression

### 2.3 Add RLS verification tests
- **Description:** Verify PostgreSQL policies enforce tenant boundaries as defense-in-depth.
- **Dependencies:** 1.3
- **Acceptance criteria:**
  - Automated DB-level tests exercise tenant and role cases
  - Negative cases included
  - RLS coverage mapped to major tenant-owned tables

### 2.4 Add search isolation tests
- **Description:** Prove that public/private and organization-scoped search documents cannot leak through Typesense queries or filters.
- **Dependencies:** 1.3, 2.1
- **Acceptance criteria:**
  - Tests cover public listings, private provider data, and cross-org attempts
  - Search schema and filters enforce visibility constraints
  - Fallback behavior does not bypass policy

### 2.5 Add storage/media access isolation tests
- **Description:** Prove signed upload/download and media access rules do not expose cross-tenant assets.
- **Dependencies:** 1.3, 2.1
- **Acceptance criteria:**
  - Unauthorized asset fetches are denied
  - Signed URL scopes and expirations are validated
  - Audit events generated for privileged media operations

### 2.6 Add worker/job tenant-scope enforcement
- **Description:** Ensure every background job payload carries tenant context and enforces policy on execution.
- **Dependencies:** 1.3, 2.1
- **Acceptance criteria:**
  - Job schema includes org context where applicable
  - Replay/retry remains tenant-safe
  - Cross-tenant job execution tests pass

### 2.7 Formalize audit event schema
- **Description:** Define immutable event structure with actor, session, request ID, organization, target, action, reason, and outcome.
- **Dependencies:** 1.4
- **Acceptance criteria:**
  - Schema documented and implemented
  - Privileged and consequential actions emit events
  - Events correlate with logs/traces/jobs via IDs

### 2.8 Create versioned threat model
- **Description:** Document trust boundaries and abuse paths across browser, API, worker, database, search, storage, and operator tooling.
- **Dependencies:** 1.3, 2.1
- **Acceptance criteria:**
  - Threat model committed under docs/security
  - Findings mapped to issues/tests
  - Reviewed at least once by maintainers/security reviewer

---

## Milestone 3: Enterprise Identity and Integration Contract

### 3.1 Introduce auth provider abstraction
- **Description:** Separate application identity logic from the underlying provider to support local/mock and enterprise federation paths.
- **Dependencies:** 1.1
- **Acceptance criteria:**
  - Auth interface defined
  - Local/mock auth remains functional
  - Enterprise adapter can be added without route rewrites

### 3.2 Implement OIDC SSO adapter
- **Description:** Add first enterprise SSO integration using OIDC, as the recommended initial path from the research.
- **Dependencies:** 3.1
- **Acceptance criteria:**
  - SSO works against at least one real OIDC provider in test/staging
  - Group/claim mapping to app roles documented
  - Login, logout, and session refresh flows are tested

### 3.3 Document SAML decision
- **Description:** Decide whether SAML is required in phase 1 or deferred behind the abstraction.
- **Dependencies:** 3.1
- **Acceptance criteria:**
  - ADR records decision, rationale, and target customers
  - If deferred, provider contract still supports adding SAML later

### 3.4 Add step-up auth for privileged actions
- **Description:** Require MFA/re-authentication for exports, role changes, moderation, provider verification, and destructive operations.
- **Dependencies:** 2.1, 3.1
- **Acceptance criteria:**
  - Step-up triggered for defined action list
  - Audit events emitted on challenge and success/failure
  - Negative tests prove bypass is not possible

### 3.5 Add session and device administration
- **Description:** Let administrators and users inspect/revoke active sessions.
- **Dependencies:** 3.1
- **Acceptance criteria:**
  - Session list visible with safe metadata
  - Revocation works within defined delay
  - Audit events recorded for revoke actions

### 3.6 Define service-account/API identity model
- **Description:** Add non-human identity support for automation and integrations.
- **Dependencies:** 3.1, 1.4
- **Acceptance criteria:**
  - Service accounts can be scoped to organizations and permissions
  - Key rotation/revocation path exists
  - Audit trail distinguishes human vs service actions

### 3.7 Generate OpenAPI from route schemas
- **Description:** Publish machine-readable API contracts from existing schema definitions and validate in CI.
- **Dependencies:** 1.1
- **Acceptance criteria:**
  - OpenAPI artifact generated on build
  - CI fails on contract drift
  - Public/internal/partner status of endpoints is documented

### 3.8 Define API versioning and deprecation policy
- **Description:** Add explicit compatibility rules, supported-version windows, and deprecation headers.
- **Dependencies:** 3.7
- **Acceptance criteria:**
  - Policy documented
  - Versioning approach applied to API routes
  - Deprecation behavior testable in CI/integration tests

### 3.9 Implement signed webhook delivery contract
- **Description:** Add event IDs, timestamps, retry semantics, replay windows, and signature verification details.
- **Dependencies:** 3.7
- **Acceptance criteria:**
  - Webhook catalog documented
  - Signatures validated in test fixtures
  - Delivery attempts and replay protections are observable

---

## Milestone 4: Reliability, Observability, and Upgrade Safety

### 4.1 Define SLOs/SLIs for critical journeys
- **Description:** Establish initial measurable targets for search, writes, auth, imports, and exports based on the research.
- **Dependencies:** 1.2
- **Acceptance criteria:**
  - SLO document published
  - Includes availability, latency, and freshness metrics
  - Targets marked as validated goals, not contractual promises

### 4.2 Add OpenTelemetry instrumentation
- **Description:** Instrument requests, DB calls, search, queue, and

---


---

# Addendum: Source-Tree Evidence (2026-08-20)

Everything above was produced under the evidence rule in *Scope and Evidence
Rules*: it was based on **repository documents and package metadata only**.
This addendum records the first pass over the **source tree itself**, so the
findings above can move from *documented* to *verified* where the code
supports it — and be corrected where it does not.

## A1. Product identity conflict: partially resolved

The report's highest-visibility finding (Executive Summary; Key Finding #10;
Strengths/Gaps row "Product clarity") is that the README presents a rental
marketplace while the implementation plan describes a text editor. The source
tree confirms this is not merely a documentation inconsistency — **both
products exist in the same tree simultaneously.**

Resolved on 2026-08-20:

- `package.json` name: `rental-marketplace` → `escribe-libre`.
- `src/lib/env.ts`: `NEXT_PUBLIC_APP_NAME` default → `Escribe Libre`.
- `.env.example` reduced from 37 vars to 15. Twenty-two vars that no code
  reads were removed (Stripe, Twilio, Sentry, Upstash, OpenAI, surplus
  Typesense/Mapbox/QStash keys, `EMAIL_FROM`, and the AI/SMS/billing flags).
  Six vars that marketplace code still reads are retained under a labelled
  legacy block, each annotated with its consumer.

Still unresolved: `README.md` and `IMPLEMENTATION_PLAN.md` remain titled
"Rental Marketplace", and the marketplace routes, APIs, and lib modules are
still present and still compile. The naming is now consistent; the **product
boundary is not**.

## A2. There are two parallel editor implementations

Not visible from documentation or `package.json`, and not mentioned anywhere
in the report above:

| | In-app editor | `upgrade/` prototype |
|---|---|---|
| Location | `src/components/editor/`, `src/lib/{editor,documents,export}/` | `upgrade/src/` |
| Build | Next.js App Router (part of the main app) | Standalone Vite + React 19 |
| Tiptap | 3.27.4 via root `package.json` | 3.27.1 via its own `package.json` |
| Size | 1,671 lines of components + 1,318 lines of lib | 854 lines total |
| Custom extensions | `inline-comment`, `page-break`, `spellcheck-indicator`, `text-index` | `CommentMark`, `SpellCheck` |
| Export | `docx` (`src/lib/export/docx-export.ts`, 256 lines) | `html2pdf.js` |
| Persistence | `idb-keyval` + `document-store.ts` (189 lines) | none |
| Extras | `.textdoc` file format, templates, page settings | `tiptap-markdown`, `@google/genai` |

`upgrade/metadata.json` describes it as *"Professional Web Text Editor — a
high-fidelity, paginated, collaborative word processor in the browser built
with Tiptap and ProseMirror"*, generated as a Google AI Studio app.

The two implementations overlap (both have a ribbon, status bar, comment
mark, and spellcheck extension) but neither is a superset. The in-app editor
has persistence, DOCX export, and a file format; the prototype has markdown,
PDF export, and a Gemini dependency. **Consolidating these is a prerequisite
for the roadmap's Phase 0 "decision and evidence reset", and is not currently
represented in that phase.**

## A3. Desktop distribution exists and is not covered above

`src-tauri/` holds a working Tauri 2 shell (Rust sources, icons, generated
schemas, `tauri.conf.json`), driven by `desktop:dev` / `desktop:build` and
`scripts/prepare-desktop-sidecar.mjs`. Ten built MSI/EXE installers totalling
~156 MB were present in the working tree; these are build artifacts and are
now gitignored, and should be distributed via GitHub Releases.

A desktop target materially expands several research tracks the report scopes
to a web deployment — code signing and notarization, update channel and
signature verification, local filesystem trust boundary, and an offline data
path outside Supabase RLS. None are addressed above.

## A4. CI evidence: what is actually proven

The report treats test/lint/build gates as *documented*. As of run
[32367869902](https://github.com/cortezsilvano-bot/Escribe-Libre/actions/runs/32367869902)
they are **verified passing**: `verify:env`, `typecheck`, `lint`,
`test` (25 tests, 9 files), and `build` all succeed, as do the
`migration-check` and `secret-scan` (gitleaks) jobs.

One gate fails. `pnpm audit --audit-level=high` reports high-severity
advisories, which also blocks the Playwright steps behind it — meaning **the
e2e and accessibility suites did not run at all**:

- `next` — Middleware/Proxy bypass, DoS, and two SSRF advisories
  (GHSA-6gpp-xcg3-4w24, GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x,
  GHSA-p9j2-gv94-2wf4); fixed in >= 16.2.11
- `sharp` / libvips — CVE-2026-33327, CVE-2026-33328, CVE-2026-35590,
  CVE-2026-35591 (GHSA-f88m-g3jw-g9cj); fixed in >= 0.35.0
- `brace-expansion` — DoS via unbounded expansion (GHSA-mh99-v99m-4gvg)

This is direct evidence for the report's dependency-provenance and SBOM gap:
the pipeline detects vulnerable dependencies but the tree ships them, and
because `audit` precedes `playwright`, a dependency advisory silently costs
all end-to-end and accessibility coverage. Reordering that step is a one-line
change worth making regardless of the upgrade timeline.

Also note `e2e/` contains exactly one spec, `marketplace.spec.ts`, targeting
marketplace pages. There is **no e2e or accessibility coverage of the editor**
— which is the surface the `@axe-core/playwright` dependency was added for.

## A5. Provenance of this document

Lines 1–467 are the curated report prepared 2026-08-18. The remainder is the
raw multi-model research aggregate it was distilled from, including per-model
sections (`# Model: GPT-5.6 Luna`), recorded model failures
(`# Model Failure: GPT-5.6`, `# Model Failure: Claude Opus 5 (1M ctx)`), and
a `# Reconciled Multi-Model Research` pass.

**The aggregate is truncated.** It ends mid-sentence in Milestone 4.2
("Instrument requests, DB calls, search, queue, and"). Anything after that
point was never captured. Readers should treat the curated first 467 lines as
authoritative and the remainder as working material.
