const allowed = new Map([["image/jpeg", ["jpg", "jpeg"]], ["image/png", ["png"]], ["image/webp", ["webp"]], ["application/pdf", ["pdf"]]]);
export interface UploadCandidate { name: string; type: string; size: number }
export function validateUpload(candidate: UploadCandidate) {
  const extension = candidate.name.split(".").pop()?.toLowerCase() ?? "";
  const extensions = allowed.get(candidate.type);
  const errors: string[] = [];
  if (!extensions || !extensions.includes(extension)) errors.push("File type and extension are not allowed or do not match.");
  if (candidate.size <= 0 || candidate.size > 15 * 1024 * 1024) errors.push("File must be between 1 byte and 15 MB.");
  return { valid: errors.length === 0, errors, requiresMalwareScan: true, requiresImageReencode: candidate.type.startsWith("image/") };
}
export interface MalwareScanner { scan(storagePath: string): Promise<{ clean: boolean; engine: string; reference?: string }> }
export class DevelopmentMalwareScanner implements MalwareScanner { async scan() { return { clean: true, engine: "development-noop" }; } }
