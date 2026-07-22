# Postman / Newman — YiYi Book Backend

This folder contains a full Postman collection covering all 116 REST endpoints of the backend (125 requests once
you count negative tests and self-contained create/delete pairs), two environments, and everything needed to run
the whole suite headlessly with **Newman** (Postman's CLI runner) in CI.

| File | Purpose |
|---|---|
| `YiYi-Book-API.postman_collection.json` | The collection — 21 folders, one per resource, ordered so later folders can reuse variables captured by earlier ones. |
| `YiYi-Book-Local-Dev.postman_environment.json` | `base_url = http://localhost:8081/api` — for local testing. |
| `YiYi-Book-Staging.postman_environment.json` | `base_url` pointing at a placeholder staging host — edit it to your real staging URL. |
| `fixtures/sample.png` | Tiny sample image used by the `POST /api/upload` request. |
| `generate_collection.py` | The script that generated the collection JSON. Edit this (not the JSON) if you need to add/change requests, then re-run `python generate_collection.py` and copy `out/*.json` back here — this keeps 125 requests consistent and avoids hand-editing a quarter-megabyte JSON file. |

## How the collection is organized

Folders are numbered `00` → `20` and are meant to run **in that order** (top to bottom), because later folders
depend on variables set by earlier ones:

- `00 Health` → `01 Auth` registers a brand-new random user (via `{{$randomEmail}}`) and logs in the two seeded
  accounts, capturing `admin_token`, `user_token`, `new_user_token`.
- Almost all "write" flows below run as `new_user_token` (the throwaway random account), **not** the shared seeded
  `user@gmail.com` — so re-running the whole collection over and over never corrupts the seed data or breaks a
  later run because a password/e-mail changed.
- `02 Books` captures `book_id` / `category_id` / `book_price` from the first item of `GET /api/books`, reused by
  Cart, Wishlist, Orders, Reviews, etc.
- `20 Admin Users` is deliberately **last** — its final request deletes the random test user created in step 1
  (cascades to its addresses/orders/reviews/etc.), cleaning up after itself.

Requests whose expected behavior depends on a business rule this backend doesn't fully enforce (see
`API_DOCUMENTATION.md`'s "Known gaps" section — e.g. missing global exception handler → 500 instead of 404) assert
`pm.expect(...).to.be.oneOf([...])` across the plausible codes instead of a single hard status, with a comment
explaining why. Requests that intentionally exercise a bug (e.g. calling an "admin" coupon endpoint as a normal
user) say so in their description.

Every request has its own **Tests** script (status code + response-time + JSON-shape/field assertions, and — where
relevant — captures values into environment variables for later requests). There's also one collection-level test
script that runs after every single request as a final sanity net (response code < 600, i.e. not a raw connection
failure).

## Prerequisites

1. Backend running locally (`./mvnw spring-boot:run`, default port `8081`) against a **fresh or previously-seeded**
   database — the Auth folder logs in with `admin@gmail.com` / `user@gmail.com` / `123456`, which only exist after
   `DataSeeder` has run once (see the main setup instructions).
2. Node.js 18+ (for Newman).

## Running from the Postman GUI

Import all three JSON files (`File → Import`), select the **YiYi Book - Local Dev** environment top-right, open the
collection, click **Run** → keep the default folder order → **Run YiYi Book...**.

## Running headlessly with Newman

```bash
# one-time install
npm install -g newman newman-reporter-htmlextra

# from backend/postman/
newman run YiYi-Book-API.postman_collection.json \
  --environment YiYi-Book-Local-Dev.postman_environment.json \
  --insecure-file-read \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export report.html
```

- `--insecure-file-read` is required because the `File Upload` request in folder `19` attaches
  `fixtures/sample.png` from disk.
- Newman's exit code is non-zero if any `pm.test()` fails — that's what CI checks.
- Swap `--environment YiYi-Book-Local-Dev.postman_environment.json` for the staging file (or your own, see below)
  to point at another server.

### Project-local npm scripts (optional, recommended)

Add a tiny `package.json` next to this README so the whole team runs the same command:

```json
{
  "name": "yiyi-book-api-tests",
  "private": true,
  "scripts": {
    "test:api": "newman run YiYi-Book-API.postman_collection.json --environment YiYi-Book-Local-Dev.postman_environment.json --insecure-file-read --reporters cli,htmlextra --reporter-htmlextra-export report.html",
    "test:api:staging": "newman run YiYi-Book-API.postman_collection.json --environment YiYi-Book-Staging.postman_environment.json --insecure-file-read --reporters cli,htmlextra --reporter-htmlextra-export report-staging.html"
  },
  "devDependencies": {
    "newman": "^6.2.1",
    "newman-reporter-htmlextra": "^1.23.1"
  }
}
```

Then: `npm install && npm run test:api`.

## Wiring it into CI/CD

A ready-to-use GitHub Actions workflow is at `.github/workflows/api-tests.yml` (repo root). It:

1. Spins up a MySQL 8 service container.
2. Builds and boots the Spring Boot backend (`./mvnw spring-boot:run`) against it in the background.
3. Waits for `GET /api/ping` to return 200 (readiness check) before running tests.
4. Runs the whole Postman collection with Newman against `http://localhost:8081/api`.
5. Uploads the HTML report as a build artifact and fails the job if any request's tests failed.

Trigger it manually from the Actions tab, or adjust the `on:` block to run on every PR that touches `backend/**`.

## Editing / extending the collection

Don't hand-edit the big JSON file. Add or change an `add(...)` call in `generate_collection.py` (it's a small
declarative list — folder, method, path, auth, body, expected test assertions), then:

```bash
python generate_collection.py
cp out/YiYi-Book-API.postman_collection.json .
```

## Known limitations of the automated run

- `01 Auth` → `Send OTP`, `Verify Forgot-Password OTP`, `Reset Password` can't fully exercise the happy path
  because the real OTP is emailed out-of-band; these run as deterministic **negative** tests instead (wrong OTP →
  expect 400/500). To test the happy path, read the OTP from your inbox/logs and paste it into the request body
  manually, then re-run just that request.
- `02 Books` → `[Admin] Bulk Import Books` sends no file on purpose (deterministic 400 "wrong format" test). To
  test the happy path, attach a real `.xlsx` built from the `/api/books/import/template` download and flip the
  expected status in that request's Tests tab to `200`.
- `18 Newsletter` → `[Admin] Send Bulk Email` really sends email to every subscriber via Brevo/SMTP — keep this
  request **disabled** (right-click → toggle) in any shared/CI environment unless you intend that side effect.
- Payment gateway requests (`11 Payment`) call out to VNPay/MoMo/ZaloPay's live sandbox APIs; they can fail with
  network errors that have nothing to do with this backend — that's why they assert `oneOf([200, 400])` rather
  than a hard 200.
