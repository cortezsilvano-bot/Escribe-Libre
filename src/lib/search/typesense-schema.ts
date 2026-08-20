export const listingCollectionSchema = {
  name: "listings_v1",
  enable_nested_fields: true,
  fields: [
    { name: "id", type: "string" }, { name: "title", type: "string" }, { name: "description", type: "string" },
    { name: "city", type: "string", facet: true }, { name: "neighborhood", type: "string", facet: true }, { name: "zip", type: "string", facet: true },
    { name: "location", type: "geopoint" }, { name: "property_type", type: "string", facet: true },
    { name: "bedrooms", type: "float", facet: true }, { name: "bathrooms", type: "float", facet: true }, { name: "square_feet", type: "int32", optional: true },
    { name: "advertised_rent_cents", type: "int32", facet: true }, { name: "estimated_total_cents", type: "int32", facet: true },
    { name: "amenities", type: "string[]", facet: true }, { name: "verified", type: "bool", facet: true }, { name: "updated_at", type: "int64" },
    { name: "source_trust", type: "int32" }, { name: "completeness", type: "int32" }, { name: "ranking_version", type: "string" },
  ],
  default_sorting_field: "updated_at",
} as const;

export const rentalSynonyms = [
  { id: "laundry", synonyms: ["washer dryer", "laundry"] }, { id: "townhome", synonyms: ["townhouse", "townhome"] },
  { id: "pets", synonyms: ["pets allowed", "pet friendly"] }, { id: "air-conditioning", synonyms: ["AC", "air conditioning"] },
  { id: "utilities", synonyms: ["bills included", "utilities included"] },
] as const;
