# Security source audit

Date: 2026-09-22. Source review only; not a penetration test, advisory scan or deployed-policy verification.

Follow-up (2026-09-23): canonical content validation now bounds JSON depth/size, checks ProseMirror structure, rejects nonserializable attributes and unsafe explicit URL schemes, and protects unreadable originals. These checks reduce the native-import finding below; they do not establish comprehensive attribute safety, a pre-parse file-size limit, ZIP decompression limits or deployed security. Cloud findings remain open.

## Existing controls

DOCX import checks extension and compressed size, catches conversion errors and sanitizes HTML with DOMPurify. The editor sanitizes HTML ingestion. Web configuration sets CSP and other response headers. Tauri restricts connections to self. SQL enables RLS on all declared public tables. CI includes secret scanning and dependency auditing.

## Findings

| Priority | Evidence | Remediation |
| --- | --- | --- |
| High | Native document content accepts arbitrary JSON outside HTML sanitization | Validate node/mark structure, attribute types, URL schemes, depth and size at import/storage boundaries. |
| High before cloud use | Document insertion allows owner assignment, but ACL management requires an existing owner ACL; no bootstrap is present | Transactional ownership bootstrap and owner/nonmember database tests. |
| High before cloud use | Document UPDATE checks ACL but does not constrain `owner_id` changes | Restrict ownership changes to an explicit authorized operation; test all roles. |
| Medium before cloud use | Insert policies for comments, suggestions, assets and versions do not bind attribution to caller | Enforce attribution; test impersonation and cross-document access. |
| Medium | DOCX limit covers compressed input, not expanded resource use | Bound decompression/conversion; test malformed and highly compressed fixtures. Bound native JSON too. |
| Medium | CSP allows HTTPS images and inline scripts | Define private asset ingestion; review nonce/hash feasibility separately for web and static desktop builds. |
| Medium | Browser storage is the active persistence layer | Recovery for corruption, quota and denied storage; never replace unreadable data. Local-first does not imply encrypted storage. |

## Desktop and database boundaries

`src-tauri/src/lib.rs` initializes opener but has no document filesystem commands. No authored capabilities directory was found. Generated ACL schemas do not prove effective deployed grants. Review built capabilities before adding filesystem access; use scoped commands and validated paths.

The RLS helper uses SECURITY DEFINER, fixed search_path and auth.uid(). Role hierarchy needs executable tests. Some tables have RLS without client policies, denying access rather than implementing features. Migration grep checks do not prove policy isolation. Service-role clients must remain server-only.

Before canonical migration, run hostile-import and recovery tests. Before cloud storage, run role-matrix database tests. Before native storage, test paths, permissions and interrupted writes. No current dependency advisory status is asserted here.
