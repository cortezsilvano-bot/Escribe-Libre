import type { Editor } from "@tiptap/react";

export type TextMatch = {
  from: number;
  to: number;
  text: string;
};

type TextSegment = {
  from: number;
  text: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function walkTextNodes(value: unknown, callback: (text: string) => void) {
  function visit(node: unknown) {
    if (!node || typeof node !== "object") {
      return;
    }

    const candidate = node as { text?: unknown; content?: unknown };
    if (typeof candidate.text === "string") {
      callback(candidate.text);
    }

    if (Array.isArray(candidate.content)) {
      candidate.content.forEach(visit);
    }
  }

  visit(value);
}

export function getWordCountFromJson(value: unknown): number {
  const words: string[] = [];

  walkTextNodes(value, (text) => {
    words.push(text);
  });

  return words.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

export function getCharacterCountFromJson(value: unknown): number {
  let count = 0;

  walkTextNodes(value, (text) => {
    count += text.length;
  });

  return count;
}

export function findMatches(
  editor: Editor,
  query: string,
  options: { caseSensitive: boolean; wholeWord: boolean },
): TextMatch[] {
  if (!query.trim()) {
    return [];
  }

  const segments: TextSegment[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      segments.push({ from: pos, text: node.text });
    }
  });

  const pattern = options.wholeWord ? `\\b${escapeRegExp(query)}\\b` : escapeRegExp(query);
  const regex = new RegExp(pattern, options.caseSensitive ? "g" : "gi");

  return segments.flatMap((segment) => {
    const matches: TextMatch[] = [];
    for (const match of segment.text.matchAll(regex)) {
      if (match.index === undefined) {
        continue;
      }
      matches.push({
        from: segment.from + match.index,
        to: segment.from + match.index + match[0].length,
        text: match[0],
      });
    }
    return matches;
  });
}

export function replaceAllMatches(editor: Editor, matches: TextMatch[], replacement: string) {
  [...matches].reverse().forEach((match) => {
    editor.chain().focus().insertContentAt({ from: match.from, to: match.to }, replacement).run();
  });
}
