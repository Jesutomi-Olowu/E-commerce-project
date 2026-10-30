# Goodbyte backend (Next.js + AWS)

TypeScript backend for the marketplace: Auth.js (buyer/seller roles), DynamoDB, S3 signed URLs, Paystack.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in.
3. Create the tables: `./scripts/create-tables.sh`
4. Create two S3 buckets: images (public via CloudFront) and files (PRIVATE, block all public access).
   Add a CORS rule on both allowing `POST` from your site's origin, so browsers can upload with the signed form.
5. `npm run dev`
6. In the Paystack dashboard, set the webhook URL to `https://YOUR-DOMAIN/api/webhooks/paystack`.

On Amplify, give the app's compute role permission for DynamoDB (3 tables + `seller-index`, `buyer-index`)
and S3 (`PutObject` on the images/files buckets, `GetObject` on the files bucket).

## Endpoints
| Method | Path | Who | What |
|---|---|---|---|
| POST | /api/register | anyone | create buyer or seller account |
| POST | /api/auth/callback/credentials | anyone | log in (Auth.js) |
| GET | /api/products | anyone | live products (`?category=`, `?mine=1` for sellers) |
| POST | /api/products | seller | create product |
| GET/PATCH/DELETE | /api/products/:id | public / owner | read, edit, soft-delete |
| POST | /api/uploads | seller | signed S3 upload form (image or file) |
| POST | /api/checkout | signed in | create order + Paystack link |
| POST | /api/webhooks/paystack | Paystack | verify signature, mark order paid |
| GET | /api/orders | signed in | my purchases |
| GET | /api/downloads/:orderId | buyer | 5-minute signed download link |

## How sellers stay separate
- `sellerId` always comes from the verified session, never from the request.
- Upload keys are prefixed with the seller's id, and product routes reject keys outside that prefix.
- Edits and deletes use a DynamoDB condition (`sellerId = :uid`), so ownership is enforced in the database too.
- Product files live in a private bucket and are only reachable through short-lived signed links for paid orders.

## Not built yet
Login/register pages, receipt emails (SES), seller payouts (earnings are recorded per order, pay manually at first), admin tools, rate limiting on login.

## Frontend (added)
Goodbyte storefront UI in the same Next.js app. Screens only talk to the backend through `lib/api.ts`.

| Route | What it is |
|---|---|
| `/` | home: hero, value row, category filter, product grid |
| `/product/[id]` | product page: buy (Paystack) and save |
| `/login`, `/register` | accounts (buyer or seller) |
| `/account/downloads` | my purchases and signed downloads |
| `/account/orders/[orderId]` | where Paystack returns the buyer; waits for the webhook, then offers the download |
| `/seller` | seller dashboard: list, publish/unpublish, remove |
| `/seller/new` | add a product with image and file upload |

S3 buckets also need a CORS rule allowing `POST` from your site (needed for browser uploads).
