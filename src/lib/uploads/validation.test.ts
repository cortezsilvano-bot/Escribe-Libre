import { describe, expect, it } from "vitest";
import { validateUpload } from "./validation";
describe("upload validation", () => {
  it("accepts bounded matching images", () => { expect(validateUpload({ name: "unit.webp", type: "image/webp", size: 1024 }).valid).toBe(true); });
  it("rejects disguised and oversized files", () => { expect(validateUpload({ name: "unit.exe", type: "image/jpeg", size: 20 * 1024 * 1024 }).errors).toHaveLength(2); });
});
