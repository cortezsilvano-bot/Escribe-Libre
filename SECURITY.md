# Security and Privacy

## Threat model

Escribe Libre is local-first, so the interesting boundaries are not network
boundaries. The content a user opens is the untrusted input: a pasted fragment,
an HTML file, or a Word document can all carry markup that must never execute in
the editor's origin.

## Controls

- **Paste.** Every paste is sanitised with DOMPurify before Tiptap sees it.
  `script`, `iframe`, `object`, and `embed` are dropped in all three paste
  modes. "Match document" additionally strips `style`, `class`, `color`,
  `face`, and `size` attributes and unwraps `span`/`font`.
- **HTML import.** Same sanitiser, same forbidden tags, applied to the file's
  text before `setContent`.
- **DOCX import.** `convertDocxToHtml` accepts only a `.docx` extension, rejects
  anything empty or over 20 MB, converts with mammoth in the browser, and
  sanitises the resulting HTML before it is inserted. The file never leaves the
  device, and a conversion failure surfaces a plain message, not a stack trace.
- **Storage.** Every record read from IndexedDB or a `.textdoc` file is parsed
  with a Zod schema. A malformed or hand-edited entry is rejected rather than
  rendered, which also bounds title, comment, and header/footer lengths.
- **Browser safety.** React escaping is the default and no user content is
  rendered with `dangerouslySetInnerHTML`. `next.config.ts` sets a strict CSP
  plus `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Permissions-Policy`, and `Cross-Origin-Opener-Policy`.
- **Outbound requests.** The app makes none by default. `connect-src` allows
  only the app's own origin and Supabase, for the optional sync mode.
- **Links and images.** Documents may reference remote images, which is why
  `img-src` allows `https:`. Remote images are a privacy consideration: opening
  a document containing one will fetch it. Links are rendered but not followed
  automatically.

## Data handling

In the default mode, no document, title, comment, or keystroke leaves the
device. There is no account, no telemetry, and no analytics. Documents live in
this browser profile's IndexedDB and preferences in `localStorage`.

That has a consequence worth stating plainly: clearing site data, using a
private window, or a browser "clean up storage" sweep deletes documents
permanently. There is no server copy to restore from. **Backup all** writes a
`.textdoc-backup` file, and it is the only recovery mechanism.

Files you export are written by the browser's download flow to wherever the
browser is configured to put them; the app does not choose a location and keeps
no copy.

## Optional sync mode

`APP_DATA_MODE=supabase` changes the trust model: documents then leave the
device. Before enabling it:

- Review every row-level security policy in `supabase/migrations` with
  integration tests; the document ACL is the whole authorisation model.
- Enable MFA on accounts that can read shared documents.
- Configure secrets only in the deployment secret store and rotate keys.
- Enable point-in-time recovery and rehearse a restore.

The service-role key must never reach the browser. It is read only in
`src/lib/supabase/server.ts` and is not part of the public env schema.

## Reporting

Report a suspected vulnerability privately to the repository owner rather than
opening a public issue. Please include the affected version, a reproduction, and
what an attacker would gain.
