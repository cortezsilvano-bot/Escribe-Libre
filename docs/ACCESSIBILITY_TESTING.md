# Accessibility Testing

Automated: run Vitest and `pnpm test:e2e`; Playwright executes axe against home, search, provider, and admin pages and fails on serious/critical findings.

Manual before release:

1. Complete search, filters, listing open, save, compare, contact, provider submission, and admin decision using keyboard only.
2. Verify focus order, focus restoration, no keyboard traps, and skip navigation.
3. Test at 200% and 400% zoom and at 320 CSS px width.
4. Verify list alternatives and status text without map/color cues.
5. Test NVDA + Firefox/Chrome, VoiceOver + Safari, and TalkBack + Chrome.
6. Enable reduced motion, forced colors/high contrast, dark mode, and large text.
7. Confirm validation summaries and live search counts are announced without excessive repetition.

