# Security Operations

Backups: enable Supabase PITR, perform monthly restore drills into an isolated project, and record recovery time/data-loss windows. Typesense is restored by reindexing PostgreSQL, not from an authoritative search backup.

Incident response: classify impact, rotate affected secrets, pause writes/jobs where needed, preserve audit/webhook evidence, notify the incident owner and counsel, remediate with forward migrations, and complete a blameless review. Do not place secrets or renter/provider message bodies into tickets.

Uploads: signed paths, MIME/extension/magic-byte checks, 15 MB image limit, decoding/re-encoding, malware adapter, and quarantine before public availability. Hosted identity providers retain sensitive evidence; only references and review metadata enter the database.

Account export/deletion: authenticate recently, export profile/workflow records in a portable format, remove or anonymize data subject to retention/audit rules, revoke sessions, and confirm completion. Audit records remain access-controlled and minimized.

