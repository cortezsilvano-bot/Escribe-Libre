# Data Model

## Inventory hierarchy

- `properties`: a parcel or rental site and normalized location.
- `buildings`: a physical structure or apartment community at a property.
- `units`: an individually leasable dwelling.
- `listings`: a time-bound canonical advertisement for a unit.
- `listing_source_records`: provenance-specific observations that collapse into a canonical listing without losing source history.

All core records use UUID primary keys and `timestamptz`. Operationally recoverable entities have `deleted_at`. Addresses store raw and normalized values, structured components, PostGIS geography, geocoder provenance/confidence, and an exact/approximate public visibility mode.

## Major aggregates

- Identity: users, user_profiles, renter_profiles, organizations, provider_accounts, organization_members, role_assignments.
- Inventory: properties, buildings, units, listings, sources, source records, import/sync/status/availability/price events, lease terms, concessions, fees, amenities, media.
- Trust: verification records/evidence metadata, fraud signals/reports, duplicate candidates, moderation cases/actions, attestations, audit logs.
- Renter: saved listings/searches, alert subscriptions, comparison sets/items, leads, contact requests, tour requests, notification preferences, recently viewed.
- System: search outbox, webhooks, idempotency keys, feature flags, jurisdiction rules, application settings.

## Cost representation

Amounts are integer cents. A charge records name, category, fixed/range/percentage/estimated amount type, cadence, required/optional, refundable/nonrefundable, provider-reported/estimated source, tax/pet/parking flags, effective dates, and notes. Concessions record kind, value, lease-length eligibility, timing, and effective dates.

The calculated read model distinguishes contract rent, effective rent, required and optional recurring charges, estimated utilities, required and optional move-in charges, refundable deposits, nonrefundable charges, and total due at move-in.

## Invariants

- Public results contain only published, non-expired canonical listings.
- `verified` display requires an active, non-expired verification record for the correct subject.
- Source identifiers are unique per source and re-imports use idempotency keys.
- Fees and prices cannot be negative; ranges must have `maximum >= minimum`.
- Consequential moderation transitions require a reason and create an audit log.
- Duplicate candidates are suggestions; no ambiguous pair is auto-merged.
- Exact private addresses and private lead contact data are never exposed through public views.

