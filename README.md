# Deal Room

Deal Room allows founders to upload fundraising documents, generate secure investor share links, and track when those documents are opened.

## Demo Credentials
- **Email:** `demo@dealroom.test`
- **Password:** `Demo123!`

---

## Meeting the Core Requirements

The application was built specifically to address the core problem: giving founders visibility into investor engagement without relying on email attachments.

| Requirement | Implementation |
| :--- | :--- |
| **Upload a document and give it a name** | Founders can upload PDFs via a direct-to-storage presigned URL flow and assign a custom, human-readable document name via the Dashboard upload form. |
| **Store document against the founder's account** | Documents are securely tied to the authenticated user via a relational `userId` foreign key in PostgreSQL. |
| **Generate a share link for an investor** | The Dashboard provides an inline "Generate investor link" button that creates a cryptographically secure, unique URL (e.g., `/d/[token]`). |
| **See when the link has been opened (with timestamps)** | **The Dashboard** provides an at-a-glance total view count for each document. Clicking into the **Document Detail Page** reveals a chronological "Recent opens" log, displaying the exact `viewedAt` timestamp, user agent, and referrer for every individual open. |

---

## Architecture & Tech Stack
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL managed via Prisma ORM
- **File Storage:** Cloudflare R2 (S3-compatible API)
- **Auth:** Custom lightweight session management using HTTP-only JWT cookies (`jose`)

## Approach & Technical Decisions

1. **Direct-to-Storage Uploads:** To prevent server memory bottlenecks and timeout errors with large pitch decks, the application uses presigned URLs. The Next.js backend generates a secure upload URL, and the browser uploads the PDF directly to Cloudflare R2.
2. **Zero-Trust File Access:** The R2 bucket is strictly private. Files are never exposed via public URLs. When an investor clicks a share link, the backend verifies the token, logs the view event, and issues a short-lived (5-minute), signed download URL.
3. **Hashed Tokens for Security:** The raw share token is shown to the founder only once upon generation. The database stores only the SHA-256 hash of the token. If the database is ever compromised, the share links remain secure and unusable.
4. **Server-Side View Tracking:** Tracking is handled via a dedicated API route handler (`/d/[token]`). When accessed, the route intercepts the request, logs the exact timestamp (`viewedAt`), user agent, and hashed IP address to the database, and then redirects the investor to the secure document URL.

## Assumptions & Trade-offs
- **PDF Only MVP:** The system currently restricts uploads to PDF format to ensure reliable, native in-browser viewing without requiring heavy third-party document rendering services.
- **Tracking Edge Cases:** The current implementation records a "view" the moment the share link route is requested. This satisfies the core requirement of knowing *when* it was opened, but is susceptible to false positives from link previews (e.g., Slack, email clients, or browser prefetching). A production-ready version would use an intermediate HTML viewer with client-side JavaScript to confirm actual human engagement.
- **Single-Player Mode:** The system assumes a 1:1 relationship between a founder and their documents. Multi-tenant team features and granular investor permissions are out of scope for this specific MVP assessment.

---

## Local Setup & Running the Project

### Prerequisites
- Node.js (v20+)
- A running PostgreSQL database
- An S3-compatible storage bucket (e.g., Cloudflare R2) with CORS configured for `http://localhost:3000`

### 1. Environment Variables
Create a `.env` file in the root directory and populate it with your database and storage credentials:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="your-random-secret"

S3_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="your-bucket-name"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_FORCE_PATH_STYLE="true"