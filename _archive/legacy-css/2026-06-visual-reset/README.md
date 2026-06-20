# Legacy CSS archive — June 2026 visual reset

This directory contains historical CSS files that have been disconnected from the application runtime.

`app/layout.tsx` loads `app/globals.css`. In turn, `app/globals.css` loads only:

- `app/styles/foundation.css`
- `app/styles/dev-reset.css`
- `app/styles/app-shell-foundation.css`

The files under `app/styles/` in this archive are retained exclusively as an archive of the previous visual layer.

Do not import these files back into the application without a separate architectural decision.
