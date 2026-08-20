import { nanoid } from "nanoid";
import {
  createDocumentRecord,
  defaultPageSettings,
  type DocumentRecord,
} from "@/lib/documents/document-model";

export type DocumentTemplate = {
  id: string;
  name: string;
  description: string;
  create: () => DocumentRecord;
};

function recordFromContent(title: string, content: DocumentRecord["content"]): DocumentRecord {
  return {
    ...createDocumentRecord(nanoid(10), title),
    title,
    content,
    pageSettings: {
      ...defaultPageSettings,
      headerText: title,
      footerText: "Textdoc",
    },
  };
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "A clean document with standard margins.",
    create: () => createDocumentRecord(nanoid(10), "Untitled document"),
  },
  {
    id: "letter",
    name: "Business letter",
    description: "Date, recipient, subject, body, and closing.",
    create: () =>
      recordFromContent("Business letter", {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: new Date().toLocaleDateString() }] },
          { type: "paragraph", content: [{ type: "text", text: "Recipient Name" }] },
          { type: "paragraph", content: [{ type: "text", text: "Subject: " }] },
          { type: "paragraph", content: [{ type: "text", text: "Dear Recipient," }] },
          { type: "paragraph", content: [{ type: "text", text: "Write the body of the letter here." }] },
          { type: "paragraph", content: [{ type: "text", text: "Sincerely," }] },
          { type: "paragraph", content: [{ type: "text", text: "Your Name" }] },
        ],
      }),
  },
  {
    id: "report",
    name: "Report",
    description: "Summary, findings, and recommendations.",
    create: () =>
      recordFromContent("Project report", {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Project report" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Executive summary" }] },
          { type: "paragraph", content: [{ type: "text", text: "Summarize the key outcome." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Findings" }] },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Finding one" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Finding two" }] }] },
            ],
          },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Recommendations" }] },
          { type: "paragraph", content: [{ type: "text", text: "List next steps and owners." }] },
        ],
      }),
  },
  {
    id: "proposal",
    name: "Proposal",
    description: "Overview, scope, timeline, and terms.",
    create: () =>
      recordFromContent("Client proposal", {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Client proposal" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Overview" }] },
          { type: "paragraph", content: [{ type: "text", text: "Describe the client problem and proposed outcome." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Scope" }] },
          { type: "paragraph", content: [{ type: "text", text: "Define deliverables, assumptions, and exclusions." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Timeline" }] },
          { type: "paragraph", content: [{ type: "text", text: "Outline milestones and dates." }] },
        ],
      }),
  },
  {
    id: "resume",
    name: "Resume",
    description: "Concise professional resume structure.",
    create: () =>
      recordFromContent("Resume", {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Your Name" }] },
          { type: "paragraph", content: [{ type: "text", text: "Email | Phone | Location | Portfolio" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Summary" }] },
          { type: "paragraph", content: [{ type: "text", text: "Write a concise professional summary." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Experience" }] },
          { type: "paragraph", content: [{ type: "text", text: "Role, Company, Dates" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Skills" }] },
          { type: "paragraph", content: [{ type: "text", text: "Skill one, skill two, skill three" }] },
        ],
      }),
  },
];
