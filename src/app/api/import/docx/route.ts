import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import mammoth from "mammoth";
import { ok, problem } from "@/lib/api/response";

export const runtime = "nodejs";

const docxMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
  "",
]);

const maxBytes = 20 * 1024 * 1024;

const styleMap = [
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
];

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return problem(400, "INVALID_FORM_DATA", "A multipart form body with a DOCX file is required.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return problem(400, "FILE_REQUIRED", "A DOCX file is required in the 'file' field.");
  }

  if (!file.name.toLowerCase().endsWith(".docx") || !docxMimeTypes.has(file.type)) {
    return problem(415, "UNSUPPORTED_FILE_TYPE", "Only .docx Word documents can be imported.");
  }

  if (file.size <= 0 || file.size > maxBytes) {
    return problem(413, "FILE_TOO_LARGE", "The document must be between 1 byte and 20 MB.");
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.convertToHtml({ buffer }, { styleMap });

    // Mammoth emits a narrow HTML subset, but the output still reaches the
    // editor as markup, so it is sanitized before it leaves the server.
    const purify = createDOMPurify(new JSDOM("").window);
    const html = purify.sanitize(result.value, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "iframe", "object", "embed", "style"],
      FORBID_ATTR: ["srcset"],
    });

    return ok({
      html,
      warnings: result.messages.filter((message) => message.type === "warning").map((message) => message.message),
    });
  } catch {
    return problem(422, "DOCX_PARSE_FAILED", "The DOCX file could not be read. It may be corrupt or password protected.");
  }
}
