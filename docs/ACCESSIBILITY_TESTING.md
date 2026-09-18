# Accessibility Testing

## Automated

Run `npm test` and `npm run test:e2e`. Playwright executes axe against the
document dashboard and the editor and fails on serious or critical findings.

Automated checks cannot see most of what matters in an editor. A rich-text
surface is a custom widget; axe will pass a toolbar that is unusable by
keyboard. The manual pass below is the real gate.

## Manual, before release

1. Complete a full document lifecycle with the keyboard only: create from a
   template, type and format, open a panel, add and resolve a comment, save a
   version snapshot, export, print, return to the dashboard, delete.
2. Verify focus order through the ribbon, that focus is restored after the
   command palette (`Ctrl/Cmd + K`) and the File menu close, that no keyboard
   trap exists inside the editor surface, and that the skip link works.
3. Confirm every ribbon control has an accessible name. Icon-only buttons rely
   entirely on `aria-label`.
4. Check the floating selection toolbar: it appears on selection and must not
   steal focus or block the text it annotates.
5. Test at 200% and 400% zoom and at 320 CSS px width. Page zoom is separate
   from browser zoom — verify both, and that the document stays reachable when
   the page frame is wider than the viewport.
6. Verify word count, character count, and save state are announced without
   excessive repetition. These update on every keystroke and are a live-region
   hazard.
7. Test NVDA + Firefox/Chrome, VoiceOver + Safari, and TalkBack + Chrome. In
   particular, confirm that typing in the document is not interrupted by
   status announcements.
8. Confirm inline comment highlights and the misspelling indicator are not
   conveyed by colour alone; both carry a `title`, and the comment thread is
   also listed in the Inspector panel.
9. Enable reduced motion, forced colours / high contrast, and large text. Check
   both the light and neon-dark themes, and that the theme toggle persists.
10. Verify the print view is readable and that the page frame prints without
    the surrounding chrome.

## Known gaps

- The document surface is a single ProseMirror editable region; there is no
  per-page or per-section landmark structure.
- `Page 1` in headers and footers is a placeholder until real pagination lands,
  so page-number announcements are not yet meaningful.
