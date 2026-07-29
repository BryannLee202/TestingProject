# YiYi Book Backend — API Documentation

Spring Boot 3 / Java 17 REST API. Base URL: `http://localhost:8081/api` (local) — all paths below are relative to
the server root (i.e. already include the `/api` prefix in code, shown here in full).

Auth scheme: `Authorization: Bearer <JWT>`. Get a token from `POST /api/auth/login`.

**Default seeded accounts** (created once by `DataSeeder` when the `users` table is empty):

| Role  | Email             | Password |
|-------|-------------------|----------|
| ADMIN | admin@gmail.com   | 123456   |
| USER  | user@gmail.com    | 123456   |

> ⚠️ **Known gaps in the current backend** (confirmed by reading `SecurityConfig.java` + every controller — not
> guesses). Fix these before shipping to real users:
> 1. **No global exception handler.** Most "not found" / business-rule errors surface as **HTTP 500**, not 404/400
>    (e.g. `GET /api/books/{badId}`). Only `ReviewController`, `ContactController`, `NewsletterController`,
>    `AdminUserController`, `AdminRewardController` and the coupon-validate endpoint return proper 4xx JSON.
> 2. **`CouponController` admin endpoints aren't admin-restricted** — `GET /coupons/all`, `POST/PUT/DELETE
>    /coupons` only require *any* logged-in user, not `ROLE_ADMIN`.
> 3. **`GET /api/notifications/admin/all` is fully public** (no auth at all) because it matches the wildcard
>    `GET /api/notifications/**` permit-all rule.
> 4. **`POST /api/notifications/admin/send` and `DELETE /api/notifications/{id}`** only require login, not admin.
> 5. **`PUT /api/orders/{id}/return/approve` and `.../reject`** are reachable by any logged-in user, not just admins.
> 6. **`GET /api/orders/{id}`** has no ownership check — any authenticated user can view any order by ID.
> 7. **`POST /api/newsletter/subscribe`** requires a Bearer token even though it's meant to be a public opt-in form.
> 8. **Secrets are hardcoded** in `application.properties` (SQL Server + Gmail SMTP creds) and in
>    `VNPayConfig.java` / `MoMoConfig.java` / `ZaloPayConfig.java` (sandbox payment keys) rather than externalized.
>    Sandbox-only, but treat as sensitive and rotate before any public repo push.
>
> ✅ **Fixed during setup/testing (2026-07-22):** `Order.java` used `columnDefinition = "NVARCHAR(MAX)"`
> (SQL-Server-only syntax) on `returnDetails`, which made MySQL's `CREATE TABLE orders` fail outright on a fresh
> database — breaking every order-related endpoint (create/list/view/cancel/return/ship/admin, ~12 endpoints) when
> running against MySQL, which is this project's actual production database (Clever Cloud, per README). Changed to
> `@Lob` (portable JPA — Hibernate maps it to `TEXT` on MySQL, `NVARCHAR(MAX)` on SQL Server automatically).
> Verified via a full Postman/Newman run: 569/569 assertions passing after the fix.
> 9. **Boolean JSON field names**: due to Lombok's getter-naming rules, primitive `boolean` fields drop the `is`
>    prefix in JSON — `Address.isDefault` → send/receive `"default"`, `Category.isFeatured` → `"featured"`,
>    `NewsletterSubscriber.active` → `"active"`. Boxed `Boolean` fields keep `is...` (`isCombo`, `isFeatured` on
>    `Book`, `isActive`/`isPartner` on `Coupon`, `isActive` on `RewardVoucher`).

All 125 requests below (116 real endpoints + negative/cleanup variants) are wired up as a ready-to-run Postman
collection — see [`postman/README.md`](postman/README.md).

---

## Auth — `/api/auth` (all public)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{name, email, password, phone, otp?}` | `{token, user}` |
| POST | `/auth/login` | `{email, password}` | `{token, user}` |
| POST | `/auth/send-otp` | `{phone, email}` | `{message}` |
| POST | `/auth/verify-forgot-otp` | `{email, otp, newPassword}` | `{message}` |
| POST | `/auth/reset-password` | `{email, otp, newPassword}` | `{message}` |

## Users — `/api/users` (authenticated)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/users/profile` | – | `User` |
| PUT | `/users/profile` | `{fullName, phone, gender, birthday, aiPreferences}` | `User` |
| PUT | `/users/password` | `{oldPassword, newPassword}` | `{message}` |

## Addresses — `/api/addresses` (authenticated)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/addresses/my-addresses` | – | `Address[]` |
| POST | `/addresses` | `{recipientName, phone, street, ward, district, city, default}` | `Address` (201) |
| PUT | `/addresses/{id}/default` | – | `{message}` |
| PUT | `/addresses/{id}` | `{recipientName, phone, city, ward, street, default}` | `Address` |
| DELETE | `/addresses/{id}` | – | `{message}` |

## Wishlist — `/api/wishlists` (authenticated)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/wishlists` | – | `Wishlist[]` |
| POST | `/wishlists/book/{bookId}` | – | `{message, isLiked}` |

## Cart — `/api/cart` (authenticated)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/cart` | – | `Cart{id, items[]}` |
| POST | `/cart` | `{bookId, quantity}` | `Cart` |
| PUT | `/cart/{bookId}` | `{bookId, quantity}` | `Cart` |
| DELETE | `/cart/{bookId}` | – | `Cart` |
| DELETE | `/cart` | – | 200 empty |

## Orders — `/api/orders`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|---|
| POST | `/orders` | any user | `{items:[{bookId,quantity,price}], shippingAddress, phoneNumber, paymentMethod, customerNote, discountCouponCode, shippingCouponCode, shippingFee, spentPoints}` | `Order` |
| GET | `/orders` | any user | – | `Order[]` (own) |
| GET | `/orders/all` | **ADMIN** | – | `Order[]` (all) |
| GET | `/orders/{id}` | any user (⚠ no ownership check) | – | `Order` |
| PUT | `/orders/{id}/shipping` | **ADMIN** | query: `status, shippingPartner, trackingNumber` | `Order` |
| PUT | `/orders/{id}/cancel` | any user | – | 200 empty |
| PUT | `/orders/{id}/payment-method` | any user | query: `method` | `Order` |
| PUT | `/orders/{id}/return` | any user | `{reason, phone, bank, details}` | 200 empty |
| PUT | `/orders/{id}/confirm-received` | any user | – | 200 empty |
| PUT | `/orders/{id}/return/approve` | ⚠ any user | – | 200 empty |
| PUT | `/orders/{id}/return/reject` | ⚠ any user | – | 200 empty |
| DELETE | `/orders/{id}` | **ADMIN** | – | 204 |
| DELETE | `/orders/bulk` | **ADMIN** | query: `ids=1,2,3` | 204 |

## Payment — `/api/payment/**` (all public, incl. gateway callbacks)

| Method | Path | Params | Response |
|---|---|---|---|
| GET | `/payment/create-url` | `amount, orderId, bankCode?` | `{url}` |
| GET | `/payment/momo/create-url` | `amount, orderId` | `{url}` |
| GET | `/payment/zalopay/create-url` | `amount, orderId` | `{url}` |
| GET | `/payment/zalopay-return` | `apptransid` | `{status, message, orderId}` |
| POST | `/payment/mock-return` | `{orderId, success}` | `{status}` |
| GET | `/payment/vnpay-return` | `vnp_*` query params | `{status, message, orderId}` |
| GET | `/payment/momo-return` | MoMo query params | `{status, message, orderId}` |
| POST | `/payment/momo-ipn` | MoMo IPN JSON payload | 200/400 |

## Books — `/api/books` (GET public, mutations ADMIN)

| Method | Path | Body/Params | Response |
|---|---|---|---|
| GET | `/books` | – | `Book[]` |
| GET | `/books/{id}` | – | `Book` |
| GET | `/books/search` | `keyword` | `Book[]` |
| GET | `/books/category/{categoryId}` | – | `Book[]` |
| GET | `/books/bestsellers` \| `/combos` \| `/latest` \| `/featured` \| `/discounted` | – | `Book[]` (cached) |
| GET | `/books/recommendations/{userId}` | `categoryId?` | `Book[]` |
| GET | `/books/import/template` | – | `.xlsx` binary |
| POST | `/books` | **ADMIN** — `{title, author, publisher, description, price, oldPrice, discount, stockQuantity, imageUrl, isCombo, isFeatured, category:{id}, additionalImages}` | `Book` |
| PUT | `/books/{id}` | **ADMIN** — same shape | `Book` |
| PUT | `/books/{id}/featured` | **ADMIN** — `{isFeatured}` | `Book` |
| POST | `/books/import` | **ADMIN** — multipart `file` (.xlsx) | `{message}` |
| DELETE | `/books/{id}` | **ADMIN** | 200 empty |

## Categories — `/api/categories` (GET public, mutations ADMIN)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/categories` | – | `Category[]` |
| GET | `/categories/{id}` | – | `Category` |
| POST | `/categories` | `{name, description, imageUrl, featured}` | `Category` |
| PUT | `/categories/{id}` | same | `Category` |
| DELETE | `/categories/{id}` | – | 200 empty |

## Banners — `/api/banners` (GET public, mutations ADMIN)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/banners` | – | `Banner[]` |
| GET | `/banners/position/{position}` | – | `Banner[]` |
| POST | `/banners` | `{imageUrl, title, linkUrl, position}` | `Banner` |
| PUT | `/banners/{id}` | same | `Banner` |
| DELETE | `/banners/{id}` | – | 200 empty |

## Coupons — `/api/coupons` (⚠ "admin" ones only require login, see gap #2 above)

| Method | Path | Body/Params | Response |
|---|---|---|---|
| GET | `/coupons` | – | `Coupon[]` (available to caller) |
| GET | `/coupons/history` | – | usage history |
| GET | `/coupons/validate` | `code, amount` | `{valid, coupon, discountAmount, message}` |
| GET | `/coupons/all` | ⚠ | `Coupon[]` (all) |
| POST | `/coupons` | ⚠ `{code, discountType, discountValue, minOrderAmount, expirationDate, isActive, maxDiscountAmount, userId, category, usageLimit, isPartner}` | `Coupon` |
| PUT | `/coupons/{id}` | ⚠ same | `Coupon` |
| DELETE | `/coupons/{id}` | ⚠ | 200 empty |

## Reviews — `/api/reviews` (authenticated — no public read despite typical storefront UX)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/reviews/book/{bookId}` | – | `Review[]` |
| GET | `/reviews/my-reviews` | – | `Review[]` |
| POST | `/reviews/book/{bookId}` | `{rating, comment, imageUrl}` | `Review` |
| POST | `/reviews/{reviewId}/like` | – | `Review` |
| POST | `/reviews/{reviewId}/comments` | `{content}` | `ReviewComment` |
| GET | `/reviews/{reviewId}/comments` | – | `ReviewComment[]` |
| POST | `/reviews/{reviewId}/report` | – | `Review` |
| GET | `/reviews/check-eligibility/{bookId}` | – | `{eligible, reason}` |

## Admin Reviews — `/api/admin/reviews` (ADMIN)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/admin/reviews` | – | `Review[]` |
| PUT | `/admin/reviews/{id}` | `{comment, rating}` | `Review` |
| POST | `/admin/reviews/{id}/dismiss-report` | – | `Review` |
| DELETE | `/admin/reviews/{id}` | – | 200 empty |

## Rewards (Y-Point) — `/api/rewards` (authenticated)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/rewards/redeem` | `{code}` | `{message}` |
| GET | `/rewards/history` | – | `PointTransaction[]` |
| POST | `/rewards/exchange` | `{points, type}` | `{message}` |

## Admin Reward Vouchers — `/api/admin/rewards` (ADMIN)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/admin/rewards` | – | `RewardVoucher[]` |
| POST | `/admin/rewards` | `{code, rewardType, rewardValue, expirationDate}` | `RewardVoucher` |
| PUT | `/admin/rewards/{id}` | `{rewardValue, expirationDate, isActive}` | `RewardVoucher` |
| DELETE | `/admin/rewards/{id}` | – | 200 empty |

## Notifications — `/api/notifications` (⚠ see gaps #3/#4 above)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/notifications` | public | – | `Notification[]` |
| GET | `/notifications/unread-count` | public | – | `Long` |
| GET | `/notifications/admin/all` | ⚠ public | – | `Notification[]` |
| POST | `/notifications` | any user | `{title, content, type, userId, isRead}` | `Notification` |
| POST | `/notifications/admin/send` | ⚠ any user | `{title, content, type, userId}` | `Notification` |
| PUT | `/notifications/{id}/read` | any user | – | `Notification` |
| PUT | `/notifications/read-all` | any user | – | 200 empty |
| DELETE | `/notifications/{id}` | ⚠ any user | – | 200 empty |

## Site Settings — `/api/settings`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/settings` | public | – | `{key: value}` map |
| POST | `/settings` | **ADMIN** | `{key: value}` map | `{success, message}` |

## Contact — `/api/contacts`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/contacts` | public | `{fullName, phone, email, content}` | `{message, data}` |
| GET | `/contacts` | **ADMIN** | – | `Contact[]` |
| PUT | `/contacts/{id}/status` | **ADMIN** | `{status}` | `{message, data}` |
| DELETE | `/contacts/{id}` | **ADMIN** | – | `{message}` |

## Newsletter — `/api/newsletter` (⚠ see gap #7 above)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/newsletter/subscribe` | ⚠ authenticated | `{email}` | `{message}` |
| POST | `/newsletter/send-bulk` | **ADMIN** | `{subject, body}` | `{message}` |
| GET | `/newsletter` | **ADMIN** | – | `NewsletterSubscriber[]` |
| DELETE | `/newsletter/{id}` | **ADMIN** | – | `{message}` |

## Admin Users — `/api/admin/users` (ADMIN)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/admin/users` | – | `User[]` |
| PUT | `/admin/users/{id}/role` | `{role: "USER"\|"ADMIN"}` | `User` |
| DELETE | `/admin/users/{id}` | – | `{message}` (cascades: deletes all of the user's orders/addresses/reviews/etc.) |

## File Upload — `/api/upload` (authenticated)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/upload` | multipart `file` | `{url: "/uploads/<uuid>.<ext>"}` |

## Health — `/api/ping` (public)

| Method | Path | Response |
|---|---|---|
| GET | `/ping` | `"pong"` (text) |

---

**Total: 116 endpoints across 23 controllers.**
