import { z } from "zod";

export const CURRENT_SCHEMA_VERSION = 1 as const;
// Unversioned records are the legacy v0 shape. Its fields are retained in v1;
// parsing applies existing page defaults and records the migration version.
// Explicit unknown versions are rejected rather than guessed or overwritten.
export const schemaVersionSchema = z.literal(CURRENT_SCHEMA_VERSION).default(CURRENT_SCHEMA_VERSION);
