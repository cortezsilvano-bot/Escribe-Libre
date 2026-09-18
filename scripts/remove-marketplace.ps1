<#
.SYNOPSIS
  Removes the leftover rental-marketplace source from the repository.

.DESCRIPTION
  Escribe Libre is a word processor. A rental-marketplace application had been
  built over this repository and taken over the active route tree. The editor is
  now wired up as the application again, but the marketplace files are still on
  disk: they still compile, and their routes are still served.

  This script deletes them. Every path below was verified to be marketplace-only
  at the time of writing; shared modules the editor depends on
  (src/lib/api/response.ts, src/lib/supabase, src/lib/documents, src/lib/editor,
  src/lib/export, src/lib/pagination, src/lib/settings) are deliberately absent.

.EXAMPLE
  # Dry run - prints what would be removed, changes nothing:
  .\scripts\remove-marketplace.ps1

.EXAMPLE
  # Actually delete:
  .\scripts\remove-marketplace.ps1 -Execute

.NOTES
  Commit or stash your work first. Run from the repository root.
#>
[CmdletBinding()]
param(
  [switch]$Execute
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  Write-Error "Run this from the repository root."
}

$paths = @(
  # --- Marketplace pages -----------------------------------------------------
  "src\app\accessibility", "src\app\account", "src\app\admin", "src\app\alerts",
  "src\app\auth", "src\app\compare", "src\app\contact-requests",
  "src\app\forgot-password", "src\app\help", "src\app\listing", "src\app\pricing",
  "src\app\privacy", "src\app\provider", "src\app\rentals", "src\app\safety",
  "src\app\saved", "src\app\saved-searches", "src\app\search", "src\app\settings",
  "src\app\sign-in", "src\app\sign-up", "src\app\terms", "src\app\tours",

  # --- Marketplace API routes ------------------------------------------------
  "src\app\api\account", "src\app\api\admin", "src\app\api\amenities",
  "src\app\api\contact-requests", "src\app\api\jobs", "src\app\api\listings",
  "src\app\api\locations", "src\app\api\provider", "src\app\api\reports",
  "src\app\api\saved-listings", "src\app\api\saved-searches", "src\app\api\search",
  "src\app\api\tour-requests", "src\app\api\webhooks",

  # --- Marketplace components ------------------------------------------------
  "src\components\account", "src\components\admin", "src\components\auth",
  "src\components\content", "src\components\listings", "src\components\locations",
  "src\components\provider", "src\components\search",
  "src\components\layout\SiteHeader.tsx", "src\components\layout\SiteFooter.tsx",

  # --- Marketplace domain, fixtures, and middleware --------------------------
  "src\data", "src\domain", "src\proxy.ts",

  # --- Marketplace libraries -------------------------------------------------
  "src\lib\analytics", "src\lib\api\moderation.ts", "src\lib\client",
  "src\lib\email", "src\lib\providers", "src\lib\search", "src\lib\total-cost",
  "src\lib\trust-safety", "src\lib\uploads",

  # --- Marketplace database, tests, and assets -------------------------------
  "supabase\migrations\0002_rental_marketplace.sql",
  "e2e\marketplace.spec.ts",
  "public\images", "public\rental-icon.svg",
  "scripts\load"
)

$found = @()
$missing = @()
foreach ($p in $paths) {
  if (Test-Path -LiteralPath $p) { $found += $p } else { $missing += $p }
}

Write-Host ""
Write-Host "Marketplace paths found: $($found.Count)" -ForegroundColor Cyan
foreach ($p in $found) { Write-Host "  $p" }

if ($missing.Count) {
  Write-Host ""
  Write-Host "Already gone: $($missing.Count)" -ForegroundColor DarkGray
  foreach ($p in $missing) { Write-Host "  $p" -ForegroundColor DarkGray }
}

if (-not $Execute) {
  Write-Host ""
  Write-Host "Dry run. Nothing was deleted." -ForegroundColor Yellow
  Write-Host "Re-run with -Execute to remove these paths." -ForegroundColor Yellow
  return
}

foreach ($p in $found) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "removed $p" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Cyan
Write-Host "  npm uninstall react-hook-form @hookform/resolvers tailwindcss"
Write-Host "  npm run verify"
Write-Host ""
Write-Host "Then review by hand:" -ForegroundColor Cyan
Write-Host "  docs\ENTERPRISE_OPEN_SOURCE_RESEARCH_REPORT.md  (covers both products)"
Write-Host "  .github\workflows\ci.yml                        (migration-check greps supabase/migrations)"
