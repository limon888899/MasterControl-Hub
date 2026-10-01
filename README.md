# Global Migration Hub

A Next.js App Router demo workspace for migration-case tracking, file review, audit activity, and print-ready document composition.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dashboard starts in the Admin demo role. Use the role selector in the top bar to preview Staff and Client permissions. Application records and audit events are saved in browser local storage; uploaded file contents stay in browser memory for the current session.

## Included

- Responsive overview, application pipeline, client/staff directory, document file manager, activity log, settings, and access/security screens.
- Application-stage updates, client-side search, mock role modes, password recovery and two-factor/biometric controls.
- Eight document templates with coordinate controls, image-template upload, QR code, high-resolution canvas rendering, PDF download, and browser print.
- `GET` and `POST /api/applications` demo routes with basic input validation.

## Production deployment requirements

This repository is a functional UI and integration starter, not a production immigration-record system. The demo API is stateless and returns sample records. Before handling real data, connect a durable database and object storage, enforce authorization in server-side routes, and integrate a managed identity provider with verified MFA and recovery. Add malware scanning, file-size/type validation on the server, encryption and retention policies, audit-log persistence, rate limits, backups, and jurisdiction-specific privacy controls. Browser role switching, local storage, sample QR verification URLs, and generated templates are demonstration behavior only and do not provide security or government-document authenticity.