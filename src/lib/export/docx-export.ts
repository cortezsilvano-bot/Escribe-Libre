"use client";

import type { JSONContent } from "@tiptap/react";
import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Header,
  PageBreak,
  PageNumber,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
  type ISectionOptions,
} from "docx";
import type { PageSettings } from "@/lib/documents/document-model";

type DocxChild = Paragraph | Table;

const headingLevels: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
};

const alignmentMap: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

function toTwips(inches: number) {
  return Math.round(inches * 1440);
}

function toHalfPoints(fontSize?: string) {
  if (!fontSize) {
    return undefined;
  }
  const numeric = Number.parseFloat(fontSize.replace("px", ""));
  return Number.isFinite(numeric) ? Math.round(numeric * 1.5) : undefined;
}

function normalizeColor(color?: string) {
  if (!color) {
    return undefined;
  }
  return color.replace("#", "").toUpperCase();
}

function textRuns(node: JSONContent): TextRun[] {
  if (node.type === "text") {
    const textStyle = node.marks?.find((mark) => mark.type === "textStyle")?.attrs ?? {};
    const highlight = node.marks?.find((mark) => mark.type === "highlight")?.attrs ?? {};

    return [
      new TextRun({
        text: node.text ?? "",
        bold: node.marks?.some((mark) => mark.type === "bold"),
        italics: node.marks?.some((mark) => mark.type === "italic"),
        strike: node.marks?.some((mark) => mark.type === "strike"),
        underline: node.marks?.some((mark) => mark.type === "underline")
          ? { type: UnderlineType.SINGLE }
          : undefined,
        color: normalizeColor(String(textStyle.color ?? "")),
        font: typeof textStyle.fontFamily === "string" ? textStyle.fontFamily : undefined,
        size: toHalfPoints(typeof textStyle.fontSize === "string" ? textStyle.fontSize : undefined),
        shading: typeof highlight.color === "string" ? { fill: normalizeColor(highlight.color) } : undefined,
      }),
    ];
  }

  if (node.type === "hardBreak") {
    return [new TextRun({ break: 1 })];
  }

  return node.content?.flatMap(textRuns) ?? [];
}

function paragraphFromNode(node: JSONContent, options: { bullet?: boolean; ordered?: boolean } = {}) {
  const attrs = node.attrs ?? {};
  const level = typeof attrs.level === "number" ? attrs.level : undefined;
  const textAlign = typeof attrs.textAlign === "string" ? attrs.textAlign : undefined;

  return new Paragraph({
    children: textRuns(node),
    heading: node.type === "heading" && level ? headingLevels[level] : undefined,
    alignment: textAlign ? alignmentMap[textAlign] : undefined,
    bullet: options.bullet ? { level: 0 } : undefined,
    numbering: options.ordered ? { reference: "default-numbering", level: 0 } : undefined,
    spacing: { after: 180 },
  });
}

function tableFromNode(node: JSONContent) {
  const rows =
    node.content?.map((row) => {
      const cells =
        row.content?.map((cell) => {
          const children = cell.content?.flatMap(blockToDocx).filter((child) => child instanceof Paragraph) ?? [
            new Paragraph(""),
          ];
          return new TableCell({
            children: children.length ? children : [new Paragraph("")],
          });
        }) ?? [];

      return new TableRow({
        children: cells.length ? cells : [new TableCell({ children: [new Paragraph("")] })],
      });
    }) ?? [];

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

function listItems(node: JSONContent, ordered: boolean) {
  return (
    node.content?.flatMap((item) =>
      item.content?.map((child) =>
        paragraphFromNode(child, {
          bullet: !ordered,
          ordered,
        }),
      ) ?? [],
    ) ?? []
  );
}

function blockToDocx(node: JSONContent): DocxChild[] {
  switch (node.type) {
    case "paragraph":
    case "heading":
      return [paragraphFromNode(node)];
    case "blockquote":
      return node.content?.map((child) => paragraphFromNode(child)) ?? [];
    case "codeBlock":
      return [
        new Paragraph({
          children: [new TextRun({ text: node.content?.map((child) => child.text ?? "").join("") ?? "", font: "Consolas" })],
          shading: { fill: "F1F5F9" },
          spacing: { before: 120, after: 180 },
        }),
      ];
    case "bulletList":
      return listItems(node, false);
    case "orderedList":
      return listItems(node, true);
    case "table":
      return [tableFromNode(node)];
    case "pageBreak":
      return [new Paragraph({ children: [new PageBreak()] })];
    default:
      return node.content?.flatMap(blockToDocx) ?? [];
  }
}

function pageOptions(settings: PageSettings): ISectionOptions["properties"] {
  const width = settings.size === "a4" ? 11906 : settings.size === "legal" ? 12240 : 12240;
  const height = settings.size === "a4" ? 16838 : settings.size === "legal" ? 20160 : 15840;

  return {
    page: {
      size: {
        width,
        height,
        orientation:
          settings.orientation === "landscape" ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
      },
      margin: {
        top: toTwips(settings.margins.top),
        right: toTwips(settings.margins.right),
        bottom: toTwips(settings.margins.bottom),
        left: toTwips(settings.margins.left),
      },
    },
  };
}

export async function createDocxBlob({
  content,
  pageSettings,
  title,
}: {
  content: JSONContent;
  pageSettings: PageSettings;
  title: string;
}) {
  const children = content.content?.flatMap(blockToDocx) ?? [new Paragraph("")];
  const document = new Document({
    creator: "Textdoc",
    title,
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: pageOptions(pageSettings),
        headers: pageSettings.headerText
          ? {
              default: new Header({
                children: [new Paragraph({ text: pageSettings.headerText, alignment: AlignmentType.CENTER })],
              }),
            }
          : undefined,
        footers:
          pageSettings.footerText || pageSettings.showPageNumbers
            ? {
                default: new Footer({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        ...(pageSettings.footerText ? [new TextRun(pageSettings.footerText)] : []),
                        ...(pageSettings.footerText && pageSettings.showPageNumbers ? [new TextRun(" · ")] : []),
                        ...(pageSettings.showPageNumbers
                          ? [new TextRun("Page "), new TextRun({ children: [PageNumber.CURRENT] })]
                          : []),
                      ],
                    }),
                  ],
                }),
              }
            : undefined,
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
