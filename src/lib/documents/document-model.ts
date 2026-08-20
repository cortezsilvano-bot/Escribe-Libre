import { z } from "zod";

export const pageSizeSchema = z.enum(["letter", "a4", "legal"]);
export const orientationSchema = z.enum(["portrait", "landscape"]);

export const pageSettingsSchema = z.object({
  size: pageSizeSchema.default("letter"),
  orientation: orientationSchema.default("portrait"),
  margins: z.object({
    top: z.number().min(0.25).max(2),
    right: z.number().min(0.25).max(2),
    bottom: z.number().min(0.25).max(2),
    left: z.number().min(0.25).max(2),
  }).default({
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  }),
  zoom: z.number().min(0.5).max(2).default(1),
  headerText: z.string().max(200).default(""),
  footerText: z.string().max(200).default(""),
  showPageNumbers: z.boolean().default(true),
});

export const documentRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  content: z.unknown(),
  pageSettings: pageSettingsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const documentVersionSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  label: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(120),
  content: z.unknown(),
  pageSettings: pageSettingsSchema,
  createdAt: z.string().datetime(),
});

export const documentCommentSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  body: z.string().trim().min(1).max(1000),
  quote: z.string().max(300).optional(),
  from: z.number().int().nonnegative().optional(),
  to: z.number().int().nonnegative().optional(),
  resolved: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PageSettings = z.infer<typeof pageSettingsSchema>;
export type DocumentRecord = z.infer<typeof documentRecordSchema>;
export type DocumentVersion = z.infer<typeof documentVersionSchema>;
export type DocumentComment = z.infer<typeof documentCommentSchema>;
export type PageSize = z.infer<typeof pageSizeSchema>;

export const defaultPageSettings: PageSettings = {
  size: "letter",
  orientation: "portrait",
  margins: {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
  },
  zoom: 1,
  headerText: "",
  footerText: "",
  showPageNumbers: true,
};

export const defaultEditorContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1, textAlign: "center" },
      content: [{ type: "text", text: "Project Proposal" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is a professional web-based text editor built on top of Tiptap and ProseMirror.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Features include:" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Rich text formatting (" },
                { type: "text", marks: [{ type: "bold" }], text: "bold" },
                { type: "text", text: ", " },
                { type: "text", marks: [{ type: "italic" }], text: "italic" },
                { type: "text", text: ", " },
                { type: "text", marks: [{ type: "underline" }], text: "underline" },
                { type: "text", text: ", " },
                { type: "text", marks: [{ type: "strike" }], text: "strikethrough" },
                { type: "text", text: ")" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Advanced typography (" },
                { type: "text", text: "superscript" },
                { type: "text", text: ", subscript, " },
                { type: "text", marks: [{ type: "textStyle", attrs: { color: "#ff0000" } }], text: "colored text" },
                { type: "text", text: ", " },
                { type: "text", marks: [{ type: "highlight", attrs: { color: "#fff200" } }], text: "highlights" },
                { type: "text", text: ")" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Paragraph alignment" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Lists and structured data" }] }],
        },
      ],
    },
    {
      type: "paragraph",
      attrs: { textAlign: "right" },
      content: [{ type: "text", text: "Try editing this document to explore the features." }],
    },
  ],
};

export function createDocumentRecord(id: string, title = "Project Proposal - Q4 Market Strategy"): DocumentRecord {
  const now = new Date().toISOString();

  return {
    id,
    title,
    content: defaultEditorContent,
    pageSettings: defaultPageSettings,
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeDocumentRecord(input: unknown): DocumentRecord {
  return documentRecordSchema.parse(input);
}
