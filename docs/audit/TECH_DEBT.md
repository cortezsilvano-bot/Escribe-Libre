# Technical debt

Source audit: 2026-09-22. Priorities follow the supplied engineering plan.

The table records the starting baseline. The first implementation adds canonical v1 validation/migration, an IndexedDB adapter boundary and protection against corrupt-record replacement. Remaining work includes full model domains, native/asset adapters, golden corpora, crash recovery and dependency alignment. See `ARCHITECTURE_CURRENT.md` for exact implementation scope.

| Priority | Evidence | Required work |
| --- | --- | --- |
| P0 | Content is `z.unknown()` | Validate JSON, node/mark structure and attributes using the real editor schema. |
| P0 | No schema version | Explicit legacy migration, future-version rejection and preservation of original unreadable records. |
| P0 | Direct IndexedDB calls | Injectable adapter preserving existing database and key names; contract tests for failures and migrations. |
| P0 | Corruption becomes missing data | Distinguish missing/corrupt/unsupported data; never overwrite a failed read. |
| P0 | Debounced autosave | Test overlapping writes, quota exhaustion, interrupted saves and closing before debounce. |
| P0 | No compatibility golden corpus | DOCX fixtures for headings, nested lists, tables, links, images, breaks and Unicode; explicit loss reporting. |
| P0 | CSS geometry only | Baseline print behavior; deterministic pagination later needs layout AST and pinned-font goldens. |
| P0 | `latest` dependencies and two lockfiles | Align versions and lockfile authority with pnpm CI; review imports before dependency removal. |
| P0 | Settings parse JSON without recovery | Handle malformed settings and denied storage without blocking document access. |
| P1 | Separate `upgrade/` editor | Define its supported role and move selected features through shared canonical contracts. |
| P2 | Flattened DOCX lists/cells; static print numbering | Extend compatibility and layout with fixture-backed behavior. |
| P3 | Disconnected Supabase scaffolding | Identity mapping, authorization tests and canonical projections before cloud storage. |

## Foundation implementation contract

Create `src/lib/schema/{document,metadata,styles,sections,fields,assets,version}.ts`. Preserve Tiptap content and make existing record fields explicit projections. Define ownership of references/review data: comments and versions currently live outside records. Every persisted schema change needs a migration.

Create `src/lib/storage/{StorageAdapter,indexedDbAdapter,desktopAdapter,assetStore}.ts`. Native desktop storage needs scoped commands, atomic writes and recovery tests; an IndexedDB alias is not native filesystem persistence. Asset bytes need stable IDs and lifecycle rules outside node attributes.

Acceptance: legacy fixtures open; future versions remain intact; invalid documents cause recoverable errors; storage/import boundaries validate; exports consume the canonical model; successful writes persist versions.

## Later sequence

P1: styles, outline/TOC, tables, equations, comments improvements, Markdown, fields, variables and desktop integration. P2: deterministic layout, sections, headers/footers, numbering, notes, citations, cross-references, tracked changes, DOCX round trips and compare. P3: optional collaboration and extensions. P4: AI, E2EE, floating objects, columns, native PDF and marketplaces.

No TODO/FIXME markers were found in `src`, `src-tauri/src` or `upgrade/src`. This does not establish absence of debt. The repository interface and Supabase helpers lack app consumers in inspected imports; no whole-program dead-code analysis was performed.
