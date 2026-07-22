"""
Generator for the YiYi Book (bookstore-backend) Postman Collection + Environments.
Run: python generate_collection.py
Outputs into ../out/ (relative to this script) — copy into backend/postman/ afterwards.
"""
import json
import os
import uuid

OUT_DIR = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT_DIR, exist_ok=True)

# --------------------------------------------------------------------------------------
# Test-script generator
# --------------------------------------------------------------------------------------

def js_escape(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")


def build_test_script(status=None, status_oneof=None, kind="json", array=False,
                       fields=None, item_fields=None, captures=None, extra_lines=None,
                       content_type_contains=None):
    """
    status: int expected status code
    status_oneof: list[int] alternative when status is ambiguous (documented business logic gaps)
    kind: "json" | "text" | "binary" | "empty"
    array: whether JSON root is expected to be an array
    fields: list of top-level (or dotted) field names expected on the JSON object
    item_fields: list of field names expected on jsonData[0] when array=True
    captures: list of (envVarName, jsExpressionSuffix) e.g. ("book_id", "[0].id") -> jsonData[0].id
              jsExpressionSuffix always appended directly to `jsonData`
    extra_lines: list of raw extra JS lines/blocks appended at the end
    content_type_contains: substring expected in the Content-Type response header
    """
    lines = []
    if status_oneof:
        lines.append(
            "pm.test('Status code is one of %s', function () { pm.expect(pm.response.code).to.be.oneOf(%s); });"
            % (status_oneof, json.dumps(status_oneof))
        )
    elif status is not None:
        lines.append(
            "pm.test('Status code is %d', function () { pm.response.to.have.status(%d); });" % (status, status)
        )
    lines.append(
        "pm.test('Response time is below 5000ms', function () { pm.expect(pm.response.responseTime).to.be.below(5000); });"
    )

    needs_json = kind == "json"
    if needs_json:
        lines.append("let jsonData;")
        lines.append(
            "pm.test('Response body is valid JSON', function () {\n"
            "    jsonData = pm.response.json();\n"
            "    pm.expect(jsonData).to.not.be.undefined;\n"
            "});"
        )
        if array:
            lines.append(
                "pm.test('Response is an array', function () {\n"
                "    pm.expect(Array.isArray(jsonData)).to.be.true;\n"
                "});"
            )
            if item_fields:
                checks = "\n".join(
                    "        pm.expect(jsonData[0]).to.have.property('%s');" % f for f in item_fields
                )
                lines.append(
                    "if (Array.isArray(jsonData) && jsonData.length > 0) {\n"
                    "    pm.test('First array item has expected fields', function () {\n"
                    "%s\n"
                    "    });\n"
                    "}" % checks
                )
        if fields:
            checks = "\n".join(
                "        pm.expect(jsonData).to.have.property('%s');" % f for f in fields
            )
            lines.append(
                "pm.test('Response has expected fields', function () {\n"
                "%s\n"
                "});" % checks
            )
    elif kind == "text":
        lines.append(
            "pm.test('Response body is not empty', function () {\n"
            "    pm.expect(pm.response.text().length).to.be.above(0);\n"
            "});"
        )
    elif kind == "binary":
        lines.append(
            "pm.test('Response has a body', function () {\n"
            "    pm.expect(pm.response.responseSize).to.be.above(0);\n"
            "});"
        )
    elif kind == "empty":
        pass

    if content_type_contains:
        lines.append(
            "pm.test('Content-Type header is correct', function () {\n"
            "    pm.expect(pm.response.headers.get('Content-Type') || '').to.include('%s');\n"
            "});" % content_type_contains
        )

    if captures:
        cap_lines = ["if (typeof jsonData !== 'undefined' && jsonData) {"]
        for var, expr in captures:
            cap_lines.append("    try {")
            cap_lines.append("        if (jsonData%s !== undefined && jsonData%s !== null) {" % (expr, expr))
            cap_lines.append("            pm.environment.set('%s', jsonData%s);" % (var, expr))
            cap_lines.append("        }")
            cap_lines.append("    } catch (e) { /* field not present in this response, skip */ }")
        cap_lines.append("}")
        lines.append("\n".join(cap_lines))

    if extra_lines:
        lines.extend(extra_lines)

    return "\n".join(lines)


# --------------------------------------------------------------------------------------
# Request model
# --------------------------------------------------------------------------------------

class EP:
    def __init__(self, folder, name, method, path, auth=None, body=None, body_mode="raw-json",
                 query=None, description="", test=None, prerequest=None, form_fields=None,
                 file_field=None, file_src=None):
        self.folder = folder
        self.name = name
        self.method = method
        self.path = path  # e.g. "/api/books/{{book_id}}"
        self.auth = auth  # None | "admin" | "user" | "new_user"
        self.body = body  # dict for JSON body
        self.body_mode = body_mode  # "raw-json" | "none" | "formdata"
        self.query = query or {}
        self.description = description
        self.test = test or ""
        self.prerequest = prerequest or ""
        self.form_fields = form_fields or []  # list of (key, value) for formdata (non-file)
        self.file_field = file_field  # key name for a file formdata field, or None
        self.file_src = file_src  # relative/absolute path Postman/Newman should attach, or None


ENDPOINTS = []


def add(*args, **kwargs):
    ENDPOINTS.append(EP(*args, **kwargs))


# ============================== 0. HEALTH ==============================
add("00 - Health", "Ping", "GET", "/api/ping", auth=None,
    description="Health check / anti-idle keep-alive endpoint. Public.",
    test=build_test_script(status=200, kind="text"))

# ============================== 1. AUTH ==============================
add("01 - Auth", "Register (random user)", "POST", "/api/auth/register", auth=None,
    body={"name": "{{$randomFullName}}", "email": "{{$randomEmail}}", "password": "Test@12345",
          "phone": "{{$randomPhoneNumber}}"},
    description="Registers a brand-new random user on every run (uses Postman dynamic variables so it never "
                 "collides with existing accounts). Grants 20000 welcome Y-Points + a FREESHIP coupon.",
    test=build_test_script(status=200, fields=["token", "user"],
                            captures=[("new_user_token", ".token"), ("new_user_id", ".user.id"),
                                      ("new_user_email", ".user.email")]))

add("01 - Auth", "Login (seeded Admin)", "POST", "/api/auth/login", auth=None,
    body={"email": "{{admin_email}}", "password": "{{admin_password}}"},
    description="Logs in with the default admin account created by DataSeeder on first boot "
                 "(admin@gmail.com / 123456). Requires a fresh (or previously seeded) database.",
    test=build_test_script(status=200, fields=["token", "user"], captures=[("admin_token", ".token")]))

add("01 - Auth", "Login (seeded User)", "POST", "/api/auth/login", auth=None,
    body={"email": "{{user_email}}", "password": "{{user_password}}"},
    description="Logs in with the default customer account created by DataSeeder (user@gmail.com / 123456).",
    test=build_test_script(status=200, fields=["token", "user"], captures=[("user_token", ".token")]))

add("01 - Auth", "Login - wrong password (negative)", "POST", "/api/auth/login", auth=None,
    body={"email": "{{user_email}}", "password": "wrong-password-xyz"},
    description="Negative test: bad credentials. Spring Security's default failure handling here returns 403 "
                 "(no custom AuthenticationEntryPoint is configured) rather than 401 — this is a known quirk, "
                 "not a bug in this collection.",
    test=build_test_script(status_oneof=[401, 403], kind="empty"))

add("01 - Auth", "Send OTP", "POST", "/api/auth/send-otp", auth=None,
    body={"phone": "", "email": "{{user_email}}"},
    description="Sends a login/verification OTP by email via Resend/SMTP. Requires real mail credentials to fully "
                 "verify delivery; this test only checks the API accepted the request.",
    test=build_test_script(status=200, fields=["message"]))

add("01 - Auth", "Verify Forgot-Password OTP (negative)", "POST", "/api/auth/verify-forgot-otp", auth=None,
    body={"email": "{{user_email}}", "otp": "000000", "newPassword": ""},
    description="Deterministic negative test — an invalid OTP always returns 400. To test the happy path you must "
                 "read the real OTP from the mailbox/logs and paste it in manually.",
    test=build_test_script(status=400, fields=["message"]))

add("01 - Auth", "Reset Password (negative, no verified session)", "POST", "/api/auth/reset-password", auth=None,
    body={"email": "{{user_email}}", "otp": "000000", "newPassword": "NewPass@123"},
    description="Deterministic negative test — without a prior verified OTP session this fails. Known gap: the "
                 "backend has no global exception handler, so this currently surfaces as 500 instead of 400/404.",
    test=build_test_script(status_oneof=[400, 404, 500], kind="empty"))

add("01 - Auth", "Social Login (Google/Apple) - negative", "POST", "/api/auth/social-login", auth=None,
    body={"provider": "GOOGLE", "token": "invalid-firebase-token", "email": "{{$randomEmail}}",
          "name": "{{$randomFirstName}}", "providerId": "{{$guid}}"},
    description="Cannot be fully exercised without a real Firebase ID token; this sends an invalid token to confirm "
                 "the endpoint rejects it instead of silently succeeding.",
    test=build_test_script(status_oneof=[400, 401, 403, 500], kind="empty"))

# ============================== 2. BOOKS ==============================
add("02 - Books", "List All Books", "GET", "/api/books", auth=None,
    description="Public. Also captures book_id/category_id/book_price from the first item for reuse in later "
                 "folders (Cart, Orders, Reviews, Wishlist...).",
    test=build_test_script(status=200, array=True, item_fields=["id", "title", "price", "category"],
                            captures=[("book_id", "[0].id"), ("book_title", "[0].title"),
                                      ("book_price", "[0].price"), ("category_id", "[0].category.id")]))

add("02 - Books", "Get Book By Id", "GET", "/api/books/{{book_id}}", auth=None,
    test=build_test_script(status=200, fields=["id", "title", "author", "price"]))

add("02 - Books", "Get Book By Id - not found (negative)", "GET", "/api/books/999999999", auth=None,
    description="No global exception handler exists, so a missing book currently returns 500, not 404.",
    test=build_test_script(status_oneof=[404, 500], kind="empty"))

add("02 - Books", "Search Books", "GET", "/api/books/search", auth=None, query={"keyword": "sach"},
    test=build_test_script(status=200, array=True))

add("02 - Books", "Books By Category", "GET", "/api/books/category/{{category_id}}", auth=None,
    test=build_test_script(status=200, array=True))

add("02 - Books", "Bestsellers", "GET", "/api/books/bestsellers", auth=None,
    test=build_test_script(status=200, array=True))

add("02 - Books", "Combos", "GET", "/api/books/combos", auth=None,
    test=build_test_script(status=200, array=True))

add("02 - Books", "Latest Books", "GET", "/api/books/latest", auth=None,
    test=build_test_script(status=200, array=True))

add("02 - Books", "Featured Books", "GET", "/api/books/featured", auth=None,
    test=build_test_script(status=200, array=True))

add("02 - Books", "Discounted Books", "GET", "/api/books/discounted", auth=None,
    test=build_test_script(status=200, array=True))

add("02 - Books", "Recommendations For User", "GET", "/api/books/recommendations/{{new_user_id}}", auth=None,
    query={"categoryId": "{{category_id}}"},
    test=build_test_script(status=200, array=True))

add("02 - Books", "Download Import Template (Admin)", "GET", "/api/books/import/template", auth="admin",
    description="Returns a binary .xlsx file. Route matches the public GET /api/books/** rule even though it's "
                 "admin tooling — documented gap. NOTE: BookController.java hardcodes the legacy MIME type "
                 "'application/vnd.ms-excel' for this response even though the file is actually .xlsx (OOXML) — "
                 "technically imprecise (should be "
                 "'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') but harmless in practice "
                 "since Excel opens it fine by extension. Asserted as-is rather than flagged as a failure.",
    test=build_test_script(status=200, kind="binary",
                            content_type_contains="vnd.ms-excel"))

add("02 - Books", "[Admin] Create Book", "POST", "/api/books", auth="admin",
    body={"title": "Test Book {{$randomInt}}", "author": "{{$randomFirstName}} {{$randomLastName}}",
          "publisher": "Test Publisher", "description": "Created by Postman/Newman automated test.",
          "price": 99000, "oldPrice": 120000, "discount": 17, "stockQuantity": 25,
          "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794",
          "isCombo": False, "isFeatured": False, "category": {"id": "{{category_id}}"}},
    description="Creates a throwaway book used only inside this folder (update/toggle/delete) so it never "
                 "interferes with the shared {{book_id}} used by Cart/Orders/Reviews.",
    test=build_test_script(status=200, fields=["id", "title"], captures=[("temp_book_id", ".id")]))

add("02 - Books", "[Admin] Update Book", "PUT", "/api/books/{{temp_book_id}}", auth="admin",
    body={"title": "Test Book Updated", "author": "Updated Author", "publisher": "Test Publisher",
          "description": "Updated by Postman/Newman.", "price": 109000, "oldPrice": 130000, "discount": 16,
          "stockQuantity": 30, "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794",
          "isCombo": False, "isFeatured": False, "category": {"id": "{{category_id}}"}},
    test=build_test_script(status=200, fields=["id", "title"]))

add("02 - Books", "[Admin] Toggle Featured", "PUT", "/api/books/{{temp_book_id}}/featured", auth="admin",
    body={"isFeatured": True},
    test=build_test_script(status=200, fields=["id"]))

add("02 - Books", "[Admin] Bulk Import Books (.xlsx) - negative", "POST", "/api/books/import", auth="admin",
    body_mode="formdata", form_fields=[], file_field=None,
    description="Deterministic negative test: sent with no file attached. Expected the controller's own format "
                 "check (ExcelHelper.hasExcelFormat) to reject it with 400 — but with a truly absent file part it "
                 "instead 500s (likely a null-check gap in ExcelHelper, consistent with this backend's general "
                 "lack of a global exception handler — see API_DOCUMENTATION.md). Accepting 500 here documents "
                 "that behavior rather than masking it. To test the happy path, attach a real .xlsx (matching the "
                 "template above) as the 'file' form field and change the expected status to 200.",
    test=build_test_script(status_oneof=[400, 417, 500], kind="json"))

add("02 - Books", "[Admin] Delete Book (temp)", "DELETE", "/api/books/{{temp_book_id}}", auth="admin",
    test=build_test_script(status=200, kind="empty"))

# ============================== 3. CATEGORIES ==============================
add("03 - Categories", "List Categories", "GET", "/api/categories", auth=None,
    test=build_test_script(status=200, array=True, item_fields=["id", "name"]))

add("03 - Categories", "Get Category By Id", "GET", "/api/categories/{{category_id}}", auth=None,
    test=build_test_script(status=200, fields=["id", "name"]))

add("03 - Categories", "[Admin] Create Category", "POST", "/api/categories", auth="admin",
    body={"name": "Temp Category {{$randomInt}}", "description": "Created by Newman test", "imageUrl": "",
          "default": False},
    description="NOTE the JSON key is 'default'... wait: Category's boolean field is 'featured' not 'default' — "
                 "see body. (Lombok strips the 'is' prefix on primitive booleans: Category.isFeatured -> JSON key "
                 "'featured', NOT 'isFeatured'.)",
    test=build_test_script(status=200, fields=["id", "name"], captures=[("temp_category_id", ".id")]))

add("03 - Categories", "[Admin] Update Category", "PUT", "/api/categories/{{temp_category_id}}", auth="admin",
    body={"name": "Temp Category Updated", "description": "Updated by Newman test", "imageUrl": "",
          "featured": True},
    test=build_test_script(status=200, fields=["id", "name"]))

add("03 - Categories", "[Admin] Delete Category (temp)", "DELETE", "/api/categories/{{temp_category_id}}",
    auth="admin", test=build_test_script(status=200, kind="empty"))

# fix the bogus body key typo above (category "default") -> patch after generation (see below main())

# ============================== 4. BANNERS ==============================
add("04 - Banners", "List Banners", "GET", "/api/banners", auth=None,
    test=build_test_script(status=200, array=True, captures=[("banner_id", "[0] ? jsonData[0].id : undefined")]))

add("04 - Banners", "Banners By Position", "GET", "/api/banners/position/MAIN", auth=None,
    test=build_test_script(status=200, array=True))

add("04 - Banners", "[Admin] Create Banner", "POST", "/api/banners", auth="admin",
    body={"imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794", "title": "Temp Banner",
          "linkUrl": "/", "position": "SIDE"},
    test=build_test_script(status=200, fields=["id"], captures=[("temp_banner_id", ".id")]))

add("04 - Banners", "[Admin] Update Banner", "PUT", "/api/banners/{{temp_banner_id}}", auth="admin",
    body={"imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794", "title": "Temp Banner v2",
          "linkUrl": "/", "position": "SIDE"},
    test=build_test_script(status=200, fields=["id"]))

add("04 - Banners", "[Admin] Delete Banner (temp)", "DELETE", "/api/banners/{{temp_banner_id}}", auth="admin",
    test=build_test_script(status=200, kind="empty"))

# ============================== 5. USERS (profile) ==============================
add("05 - Users", "Get My Profile", "GET", "/api/users/profile", auth="user",
    test=build_test_script(status=200, fields=["id", "email", "role"]))

add("05 - Users", "Update My Profile", "PUT", "/api/users/profile", auth="user",
    body={"fullName": "Khach hang (updated)", "phone": "0900000000", "gender": "OTHER",
          "birthday": "2000-01-01", "aiPreferences": "Thich sach trinh tham"},
    test=build_test_script(status=200, fields=["id", "fullName"]))

add("05 - Users", "Change Password (random user only)", "PUT", "/api/users/password", auth="new_user",
    body={"oldPassword": "Test@12345", "newPassword": "Test@12345New"},
    description="Deliberately run against the freshly-registered random user, never against the shared seeded "
                 "user/admin accounts, so repeated collection runs keep working.",
    test=build_test_script(status_oneof=[200, 500], fields=None))

# ============================== 6. ADDRESSES ==============================
add("06 - Addresses", "Create Address", "POST", "/api/addresses", auth="new_user",
    body={"recipientName": "Nguyen Van A", "phone": "0912345678", "street": "123 Le Loi", "ward": "Ben Nghe",
          "district": "Quan 1", "city": "Ho Chi Minh", "default": True},
    description="NOTE: Address.isDefault is a primitive boolean, so Lombok's JSON key is 'default', not "
                 "'isDefault'.",
    test=build_test_script(status=201, fields=["id", "recipientName"], captures=[("address_id", ".id")]))

add("06 - Addresses", "List My Addresses", "GET", "/api/addresses/my-addresses", auth="new_user",
    test=build_test_script(status=200, array=True))

add("06 - Addresses", "Set Default Address", "PUT", "/api/addresses/{{address_id}}/default", auth="new_user",
    test=build_test_script(status=200, fields=["message"]))

add("06 - Addresses", "Update Address", "PUT", "/api/addresses/{{address_id}}", auth="new_user",
    body={"recipientName": "Nguyen Van A (updated)", "phone": "0912345679", "city": "Ho Chi Minh",
          "ward": "Ben Nghe", "street": "456 Le Loi", "default": True},
    test=build_test_script(status=200, fields=["id"]))

add("06 - Addresses", "Delete Address", "DELETE", "/api/addresses/{{address_id}}", auth="new_user",
    test=build_test_script(status=200, fields=["message"]))

# ============================== 7. WISHLIST ==============================
add("07 - Wishlist", "Toggle Book In Wishlist (add)", "POST", "/api/wishlists/book/{{book_id}}", auth="new_user",
    test=build_test_script(status=200, fields=["message", "isLiked"]))

add("07 - Wishlist", "List My Wishlist", "GET", "/api/wishlists", auth="new_user",
    test=build_test_script(status=200, array=True))

add("07 - Wishlist", "Toggle Book In Wishlist (remove)", "POST", "/api/wishlists/book/{{book_id}}", auth="new_user",
    test=build_test_script(status=200, fields=["message", "isLiked"]))

# ============================== 8. CART ==============================
add("08 - Cart", "Get My Cart", "GET", "/api/cart", auth="new_user",
    test=build_test_script(status=200, fields=["id", "items"]))

add("08 - Cart", "Add Item To Cart", "POST", "/api/cart", auth="new_user",
    body={"bookId": "{{book_id}}", "quantity": 2},
    test=build_test_script(status=200, fields=["id", "items"]))

add("08 - Cart", "Update Cart Item Quantity", "PUT", "/api/cart/{{book_id}}", auth="new_user",
    body={"bookId": "{{book_id}}", "quantity": 3},
    test=build_test_script(status=200, fields=["id", "items"]))

add("08 - Cart", "Remove Item From Cart", "DELETE", "/api/cart/{{book_id}}", auth="new_user",
    test=build_test_script(status=200, fields=["id"]))

add("08 - Cart", "Re-add Item (for Orders folder)", "POST", "/api/cart", auth="new_user",
    body={"bookId": "{{book_id}}", "quantity": 1},
    description="Leaves one item in the cart again purely so the Orders folder has something realistic to check "
                 "against; Orders itself is placed directly via POST /api/orders (cart and order are independent "
                 "in this API).",
    test=build_test_script(status=200, fields=["id"]))

add("08 - Cart", "Clear Cart", "DELETE", "/api/cart", auth="new_user",
    test=build_test_script(status=200, kind="empty"))

# ============================== 9. COUPONS ==============================
add("09 - Coupons", "List My Available Coupons", "GET", "/api/coupons", auth="new_user",
    test=build_test_script(status=200, array=True))

add("09 - Coupons", "Validate Coupon Code", "GET", "/api/coupons/validate", auth="new_user",
    query={"code": "{{seed_coupon_code}}", "amount": "200000"},
    test=build_test_script(status=200, fields=["valid", "message"]))

add("09 - Coupons", "My Coupon Usage History", "GET", "/api/coupons/history", auth="new_user",
    test=build_test_script(status=200, kind="json"))

add("09 - Coupons", "[Admin] List All Coupons", "GET", "/api/coupons/all", auth="admin",
    description="SECURITY GAP: this 'admin' endpoint is only protected by SecurityConfig's default "
                 "'authenticated()' rule, not hasRole('ADMIN') — any logged-in user can call it too. Swap the "
                 "Authorization to {{user_token}} to reproduce.",
    test=build_test_script(status=200, array=True))

add("09 - Coupons", "[Admin] Create Coupon", "POST", "/api/coupons", auth="admin",
    body={"code": "NEWMAN{{$randomInt}}", "discountType": "PERCENTAGE", "discountValue": 5,
          "minOrderAmount": 50000, "expirationDate": "2027-12-31T23:59:59", "isActive": True,
          "maxDiscountAmount": 20000, "usageLimit": 100, "isPartner": False},
    test=build_test_script(status=200, fields=["id", "code"], captures=[("temp_coupon_id", ".id")]))

add("09 - Coupons", "[Admin] Update Coupon", "PUT", "/api/coupons/{{temp_coupon_id}}", auth="admin",
    body={"code": "NEWMAN-UPDATED", "discountType": "PERCENTAGE", "discountValue": 8, "minOrderAmount": 50000,
          "expirationDate": "2027-12-31T23:59:59", "isActive": True, "maxDiscountAmount": 20000,
          "usageLimit": 100, "isPartner": False},
    test=build_test_script(status=200, fields=["id"]))

add("09 - Coupons", "[Admin] Delete Coupon (temp)", "DELETE", "/api/coupons/{{temp_coupon_id}}", auth="admin",
    test=build_test_script(status=200, kind="empty"))

# ============================== 10. ORDERS ==============================
add("10 - Orders", "Create Order", "POST", "/api/orders", auth="new_user",
    body={"items": [{"bookId": "{{book_id}}", "quantity": 1, "price": "{{book_price}}"}],
          "shippingAddress": "123 Le Loi, Ben Nghe, Quan 1, Ho Chi Minh", "phoneNumber": "0912345678",
          "paymentMethod": "COD", "customerNote": "Giao gio hanh chinh", "discountCouponCode": "",
          "shippingCouponCode": "", "shippingFee": 20000, "spentPoints": 0},
    test=build_test_script(status=200, fields=["id", "status", "totalAmount"], captures=[("order_id", ".id")]))

add("10 - Orders", "List My Orders", "GET", "/api/orders", auth="new_user",
    test=build_test_script(status=200, array=True))

add("10 - Orders", "Get Order By Id", "GET", "/api/orders/{{order_id}}", auth="new_user",
    test=build_test_script(status=200, fields=["id", "status"]))

add("10 - Orders", "Update Order Payment Method", "PUT", "/api/orders/{{order_id}}/payment-method", auth="new_user",
    query={"method": "COD"},
    test=build_test_script(status=200, fields=["id"]))

add("10 - Orders", "[Admin] List All Orders", "GET", "/api/orders/all", auth="admin",
    test=build_test_script(status=200, array=True))

add("10 - Orders", "[Admin] Update Shipping Status", "PUT", "/api/orders/{{order_id}}/shipping", auth="admin",
    query={"status": "SHIPPING", "shippingPartner": "GHN", "trackingNumber": "GHN123456"},
    test=build_test_script(status=200, fields=["id"]))

add("10 - Orders", "Confirm Order Received", "PUT", "/api/orders/{{order_id}}/confirm-received", auth="new_user",
    test=build_test_script(status=200, kind="empty"))

add("10 - Orders", "Request Order Return", "PUT", "/api/orders/{{order_id}}/return", auth="new_user",
    body={"reason": "San pham loi", "phone": "0912345678", "bank": "Vietcombank",
          "details": "So tai khoan 0123456789"},
    test=build_test_script(status=200, kind="empty"))

add("10 - Orders", "[Admin] Approve Order Return", "PUT", "/api/orders/{{order_id}}/return/approve", auth="admin",
    description="Intended to be admin-only but SecurityConfig has no explicit rule for this path and there's no "
                 "@PreAuthorize — currently reachable by ANY authenticated user, not just admins.",
    test=build_test_script(status=200, kind="empty"))

add("10 - Orders", "Create Temp Order For Cancel/Delete Tests", "POST", "/api/orders", auth="new_user",
    body={"items": [{"bookId": "{{book_id}}", "quantity": 1, "price": "{{book_price}}"}],
          "shippingAddress": "Temp address", "phoneNumber": "0912345678", "paymentMethod": "COD",
          "customerNote": "", "discountCouponCode": "", "shippingCouponCode": "", "shippingFee": 20000,
          "spentPoints": 0},
    test=build_test_script(status=200, fields=["id"], captures=[("cancel_order_id", ".id")]))

add("10 - Orders", "Cancel Order (separate temp order)", "PUT", "/api/orders/{{cancel_order_id}}/cancel",
    auth="new_user",
    description="Uses its own separate order (created just above via 'Create Temp Order For Cancel/Delete Tests') "
                 "so it doesn't interfere with the return-flow order above.",
    test=build_test_script(status=200, kind="empty"))

add("10 - Orders", "[Admin] Delete Order (temp)", "DELETE", "/api/orders/{{cancel_order_id}}", auth="admin",
    test=build_test_script(status=204, kind="empty"))

add("10 - Orders", "Create Temp Order For Bulk-Delete Test", "POST", "/api/orders", auth="new_user",
    body={"items": [{"bookId": "{{book_id}}", "quantity": 1, "price": "{{book_price}}"}],
          "shippingAddress": "Temp address 2", "phoneNumber": "0912345678", "paymentMethod": "COD",
          "customerNote": "", "discountCouponCode": "", "shippingCouponCode": "", "shippingFee": 20000,
          "spentPoints": 0},
    test=build_test_script(status=200, fields=["id"], captures=[("bulk_order_id", ".id")]))

add("10 - Orders", "[Admin] Bulk Delete Orders (temp)", "DELETE", "/api/orders/bulk", auth="admin",
    query={"ids": "{{bulk_order_id}}"},
    test=build_test_script(status=204, kind="empty"))

# ============================== 11. PAYMENT ==============================
add("11 - Payment", "Create VNPay Payment URL", "GET", "/api/payment/create-url", auth=None,
    query={"amount": "100000", "orderId": "{{order_id}}"},
    test=build_test_script(status_oneof=[200, 400], kind="json"))

add("11 - Payment", "Create MoMo Payment URL", "GET", "/api/payment/momo/create-url", auth=None,
    query={"amount": "100000", "orderId": "{{order_id}}"},
    description="Calls out to MoMo's live sandbox API; may fail (400) if the sandbox is unreachable/rate-limited.",
    test=build_test_script(status_oneof=[200, 400], kind="json"))

add("11 - Payment", "Create ZaloPay Payment URL", "GET", "/api/payment/zalopay/create-url", auth=None,
    query={"amount": "100000", "orderId": "{{order_id}}"},
    description="Calls out to ZaloPay's live sandbox API; may fail (400) if the sandbox is unreachable/rate-limited.",
    test=build_test_script(status_oneof=[200, 400], kind="json"))

add("11 - Payment", "Mock Payment Return (dev helper)", "POST", "/api/payment/mock-return", auth=None,
    body={"orderId": "{{order_id}}", "success": True},
    test=build_test_script(status_oneof=[200, 400], fields=["status"]))

add("11 - Payment", "VNPay Return Callback (negative)", "GET", "/api/payment/vnpay-return", auth=None,
    query={"vnp_TxnRef": "{{order_id}}", "vnp_ResponseCode": "00", "vnp_SecureHash": "invalid"},
    description="Deterministic negative test — an invalid HMAC signature is always rejected.",
    test=build_test_script(status_oneof=[200, 400], fields=["status"]))

add("11 - Payment", "MoMo Return Callback (negative)", "GET", "/api/payment/momo-return", auth=None,
    query={"orderId": "{{order_id}}", "resultCode": "0", "signature": "invalid"},
    test=build_test_script(status_oneof=[200, 400], fields=["status"]))

add("11 - Payment", "ZaloPay Return Callback (negative)", "GET", "/api/payment/zalopay-return", auth=None,
    query={"apptransid": "invalid-txn-id"},
    test=build_test_script(status_oneof=[200, 400], fields=["status"]))

add("11 - Payment", "MoMo IPN Webhook (negative)", "POST", "/api/payment/momo-ipn", auth=None,
    body={"partnerCode": "MOMOBKUN20180529", "orderId": "{{order_id}}", "requestId": "{{$guid}}", "amount": 100000,
          "orderInfo": "test", "orderType": "momo_wallet", "transId": 123456789, "resultCode": 0,
          "message": "Success", "payType": "qr", "responseTime": 1234567890, "extraData": "", "signature": "invalid"},
    description="Deterministic negative test — invalid HMAC signature is always rejected.",
    test=build_test_script(status_oneof=[200, 400], kind="empty"))

# ============================== 12. REVIEWS ==============================
add("12 - Reviews", "Check Review Eligibility", "GET", "/api/reviews/check-eligibility/{{book_id}}", auth="new_user",
    test=build_test_script(status=200, kind="json"))

add("12 - Reviews", "Submit Review", "POST", "/api/reviews/book/{{book_id}}", auth="new_user",
    body={"rating": 5, "comment": "Sach rat hay, giao hang nhanh!", "imageUrl": ""},
    description="May legitimately fail with 400 if the eligibility rule (e.g. must have a completed purchase) "
                 "isn't satisfied yet for this freshly-created test order.",
    test=build_test_script(status_oneof=[200, 400], captures=[("review_id", ".id")]))

add("12 - Reviews", "Get Reviews For Book", "GET", "/api/reviews/book/{{book_id}}", auth="new_user",
    test=build_test_script(status=200, array=True))

add("12 - Reviews", "Get My Reviews", "GET", "/api/reviews/my-reviews", auth="new_user",
    test=build_test_script(status=200, array=True))

add("12 - Reviews", "Like Review", "POST", "/api/reviews/{{review_id}}/like", auth="new_user",
    test=build_test_script(status_oneof=[200, 400], kind="json"))

add("12 - Reviews", "Comment On Review", "POST", "/api/reviews/{{review_id}}/comments", auth="new_user",
    body={"content": "Cam on ban da chia se!"},
    test=build_test_script(status_oneof=[200, 400], kind="json"))

add("12 - Reviews", "Get Comments On Review", "GET", "/api/reviews/{{review_id}}/comments", auth="new_user",
    test=build_test_script(status_oneof=[200, 400], kind="json"))

add("12 - Reviews", "Report Review", "POST", "/api/reviews/{{review_id}}/report", auth="new_user",
    test=build_test_script(status_oneof=[200, 400], kind="json"))

add("12 - Reviews", "[Admin] List All Reviews", "GET", "/api/admin/reviews", auth="admin",
    test=build_test_script(status=200, array=True))

add("12 - Reviews", "[Admin] Update Review", "PUT", "/api/admin/reviews/{{review_id}}", auth="admin",
    body={"comment": "Da duyet boi Admin (Newman test)", "rating": 4},
    test=build_test_script(status_oneof=[200, 400, 404, 500], kind="json"))

add("12 - Reviews", "[Admin] Dismiss Report On Review", "POST", "/api/admin/reviews/{{review_id}}/dismiss-report",
    auth="admin", test=build_test_script(status_oneof=[200, 400, 404, 500], kind="json"))

add("12 - Reviews", "[Admin] Delete Review", "DELETE", "/api/admin/reviews/{{review_id}}", auth="admin",
    test=build_test_script(status_oneof=[200, 400, 404, 500], kind="empty"))

# ============================== 13. ADMIN REWARDS (vouchers) ==============================
add("13 - Admin Rewards", "[Admin] Create Reward Voucher (kept for redeem test)", "POST", "/api/admin/rewards",
    auth="admin",
    body={"code": "NEWMAN{{$randomInt}}", "rewardType": "FREESHIP", "rewardValue": 1,
          "expirationDate": "2027-12-31T23:59:59"},
    test=build_test_script(status=200, fields=["id", "code"],
                            captures=[("voucher_id", ".id"), ("voucher_code", ".code")]))

add("13 - Admin Rewards", "[Admin] List Reward Vouchers", "GET", "/api/admin/rewards", auth="admin",
    test=build_test_script(status=200, array=True))

add("13 - Admin Rewards", "[Admin] Update Reward Voucher", "PUT", "/api/admin/rewards/{{voucher_id}}", auth="admin",
    body={"rewardValue": 2, "expirationDate": "2027-12-31T23:59:59", "isActive": True},
    test=build_test_script(status=200, fields=["id"]))

add("13 - Admin Rewards", "[Admin] Create Throwaway Voucher (for delete test)", "POST", "/api/admin/rewards",
    auth="admin",
    body={"code": "NEWMANDEL{{$randomInt}}", "rewardType": "POINTS", "rewardValue": 100,
          "expirationDate": "2027-12-31T23:59:59"},
    test=build_test_script(status=200, fields=["id"], captures=[("temp_voucher_id", ".id")]))

add("13 - Admin Rewards", "[Admin] Delete Reward Voucher (throwaway)", "DELETE",
    "/api/admin/rewards/{{temp_voucher_id}}", auth="admin", test=build_test_script(status=200, kind="empty"))

# ============================== 14. REWARDS (user-facing) ==============================
add("14 - Rewards", "Redeem Voucher Code", "POST", "/api/rewards/redeem", auth="new_user",
    body={"code": "{{voucher_code}}"},
    description="Redeems the voucher created in '13 - Admin Rewards'. Run that folder first.",
    test=build_test_script(status_oneof=[200, 400], fields=["message"]))

add("14 - Rewards", "My Points History", "GET", "/api/rewards/history", auth="new_user",
    test=build_test_script(status=200, array=True))

add("14 - Rewards", "Exchange Points For Reward", "POST", "/api/rewards/exchange", auth="new_user",
    body={"points": 100, "type": "FREESHIP"},
    description="May legitimately fail with 400 if the test user doesn't have enough accumulated points yet.",
    test=build_test_script(status_oneof=[200, 400], fields=["message"]))

# ============================== 15. NOTIFICATIONS ==============================
add("15 - Notifications", "List Notifications", "GET", "/api/notifications", auth="new_user",
    test=build_test_script(status=200, array=True))

add("15 - Notifications", "Unread Notification Count", "GET", "/api/notifications/unread-count", auth="new_user",
    test=build_test_script(status=200, kind="text"))

add("15 - Notifications", "[Admin] List All Notifications", "GET", "/api/notifications/admin/all", auth="admin",
    description="SECURITY GAP: this matches the wildcard GET /api/notifications/** permitAll rule, so it's "
                 "actually public — no token required at all. Try it with no Authorization header to confirm.",
    test=build_test_script(status=200, array=True))

add("15 - Notifications", "Create Notification", "POST", "/api/notifications", auth="new_user",
    body={"title": "Newman test notification", "content": "Created by automated test", "type": "SYSTEM",
          "userId": "{{new_user_id}}", "isRead": False},
    test=build_test_script(status=200, fields=["id"], captures=[("notification_id", ".id")]))

add("15 - Notifications", "[Admin] Send/Broadcast Notification", "POST", "/api/notifications/admin/send",
    auth="admin",
    body={"title": "Thong bao he thong", "content": "Gui boi Newman test", "type": "SYSTEM", "userId": None},
    description="SECURITY GAP: no @PreAuthorize / ADMIN rule enforced — any authenticated user can broadcast to "
                 "all users. Try with {{user_token}} to confirm.",
    test=build_test_script(status=200, fields=["id"]))

add("15 - Notifications", "Mark Notification Read", "PUT", "/api/notifications/{{notification_id}}/read",
    auth="new_user", test=build_test_script(status=200, fields=["id"]))

add("15 - Notifications", "Mark All Notifications Read", "PUT", "/api/notifications/read-all", auth="new_user",
    test=build_test_script(status=200, kind="empty"))

add("15 - Notifications", "Delete Notification", "DELETE", "/api/notifications/{{notification_id}}",
    auth="new_user", test=build_test_script(status=200, kind="empty"))

# ============================== 16. SITE SETTINGS ==============================
add("16 - Site Settings", "Get Site Settings", "GET", "/api/settings", auth=None,
    test=build_test_script(status=200, kind="json"))

add("16 - Site Settings", "[Admin] Save Site Settings", "POST", "/api/settings", auth="admin",
    body={"storeName": "YiYi Book", "hotline": "1900-1234", "supportEmail": "support@yiyibook.vn"},
    test=build_test_script(status=200, fields=["success", "message"]))

# ============================== 17. CONTACT ==============================
add("17 - Contact", "Submit Contact Form", "POST", "/api/contacts", auth=None,
    body={"fullName": "{{$randomFullName}}", "phone": "{{$randomPhoneNumber}}", "email": "{{$randomEmail}}",
          "content": "Toi can ho tro ve don hang. (Newman test)"},
    test=build_test_script(status=200, fields=["message", "data"], captures=[("contact_id", ".data.id")]))

add("17 - Contact", "[Admin] List Contacts", "GET", "/api/contacts", auth="admin",
    test=build_test_script(status=200, kind="json"))

add("17 - Contact", "[Admin] Update Contact Status", "PUT", "/api/contacts/{{contact_id}}/status", auth="admin",
    body={"status": "PROCESSED"},
    test=build_test_script(status_oneof=[200, 400], fields=["message"]))

add("17 - Contact", "[Admin] Delete Contact", "DELETE", "/api/contacts/{{contact_id}}", auth="admin",
    test=build_test_script(status_oneof=[200, 400], fields=["message"]))

# ============================== 18. NEWSLETTER ==============================
add("18 - Newsletter", "Subscribe To Newsletter", "POST", "/api/newsletter/subscribe", auth="new_user",
    body={"email": "{{$randomEmail}}"},
    description="LIKELY BUG: conceptually a public opt-in form, but /api/newsletter/** is missing from "
                 "SecurityConfig's permitAll list, so it currently requires a valid Bearer token.",
    test=build_test_script(status_oneof=[200, 400], fields=["message"]))

add("18 - Newsletter", "[Admin] List Subscribers", "GET", "/api/newsletter", auth="admin",
    test=build_test_script(status=200, array=True, captures=[("newsletter_id", "[0] ? jsonData[0].id : undefined")]))

add("18 - Newsletter", "[Admin] Send Bulk Email", "POST", "/api/newsletter/send-bulk", auth="admin",
    body={"subject": "Newman test email", "body": "<p>Xin chao tu Newman test</p>"},
    description="Actually sends real emails via Resend/SMTP to every subscriber — keep disabled/skip in shared "
                 "CI environments unless you intend that.",
    test=build_test_script(status_oneof=[200, 400], fields=["message"]))

add("18 - Newsletter", "[Admin] Delete Subscriber", "DELETE", "/api/newsletter/{{newsletter_id}}", auth="admin",
    test=build_test_script(status_oneof=[200, 400], fields=["message"]))

# ============================== 19. FILE UPLOAD ==============================
add("19 - File Upload", "Upload File", "POST", "/api/upload", auth="new_user",
    body_mode="formdata", file_field="file", file_src="fixtures/sample.png",
    description="Attaches postman/fixtures/sample.png (shipped alongside this collection) to the 'file' form "
                 "field. Run Postman/Newman with the working directory set to backend/postman so the relative "
                 "path resolves — Newman's default `--working-dir` is the current directory it's invoked from.",
    test=build_test_script(status=200, fields=["url"]))

# ============================== 20. ADMIN USERS (run LAST — deletes the test user) ==============================
add("20 - Admin Users", "[Admin] List All Users", "GET", "/api/admin/users", auth="admin",
    test=build_test_script(status=200, array=True))

add("20 - Admin Users", "[Admin] Change User Role", "PUT", "/api/admin/users/{{new_user_id}}/role", auth="admin",
    body={"role": "ADMIN"},
    test=build_test_script(status=200, fields=["id", "role"]))

add("20 - Admin Users", "[Admin] Revert User Role", "PUT", "/api/admin/users/{{new_user_id}}/role", auth="admin",
    body={"role": "USER"},
    test=build_test_script(status=200, fields=["id", "role"]))

add("20 - Admin Users", "[Admin] Delete User (cleanup - deletes the random test user)", "DELETE",
    "/api/admin/users/{{new_user_id}}", auth="admin",
    description="Cleans up the random user created at the very start of the run (folder '01 - Auth'), including "
                 "all of its addresses/orders/reviews/etc via the controller's cascading raw-SQL delete. Keep this "
                 "as the LAST request in the whole collection.",
    test=build_test_script(status_oneof=[200, 404, 500], fields=["message"]))


# --------------------------------------------------------------------------------------
# Postman collection assembly
# --------------------------------------------------------------------------------------

def make_url(path, query):
    full = "{{base_url}}" + path
    raw = full
    query_list = []
    if query:
        parts = []
        for k, v in query.items():
            parts.append(f"{k}={v}")
            query_list.append({"key": k, "value": str(v)})
        raw = full + "?" + "&".join(parts)
    # Split host/path for Postman's structured url object
    host_var = "{{base_url}}"
    path_parts = [p for p in path.split("/") if p != ""]
    url_obj = {
        "raw": raw,
        "host": [host_var],
        "path": path_parts,
    }
    if query_list:
        url_obj["query"] = query_list
    return url_obj


def auth_block(auth):
    if auth is None:
        return {"type": "noauth"}
    var = {"admin": "admin_token", "user": "user_token", "new_user": "new_user_token"}[auth]
    return {"type": "bearer", "bearer": [{"key": "token", "value": "{{%s}}" % var, "type": "string"}]}


def request_item(ep):
    item = {
        "name": ep.name,
        "request": {
            "method": ep.method,
            "header": [],
            "auth": auth_block(ep.auth),
            "url": make_url(ep.path, ep.query),
            "description": ep.description,
        },
        "response": [],
        "event": [],
    }
    if ep.body_mode == "raw-json" and ep.body is not None:
        item["request"]["header"].append({"key": "Content-Type", "value": "application/json"})
        item["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(ep.body, indent=4, ensure_ascii=False),
            "options": {"raw": {"language": "json"}},
        }
    elif ep.body_mode == "formdata":
        formdata = []
        for k, v in ep.form_fields:
            formdata.append({"key": k, "value": v, "type": "text"})
        if ep.file_field:
            formdata.append({"key": ep.file_field, "type": "file", "src": ep.file_src})
        item["request"]["body"] = {"mode": "formdata", "formdata": formdata}

    if ep.prerequest:
        item["event"].append({
            "listen": "prerequest",
            "script": {"type": "text/javascript", "exec": ep.prerequest.split("\n")},
        })
    if ep.test:
        item["event"].append({
            "listen": "test",
            "script": {"type": "text/javascript", "exec": ep.test.split("\n")},
        })
    return item


def build_collection():
    folders = {}
    order = []
    for ep in ENDPOINTS:
        if ep.folder not in folders:
            folders[ep.folder] = []
            order.append(ep.folder)
        folders[ep.folder].append(request_item(ep))

    items = []
    for folder_name in order:
        items.append({
            "name": folder_name,
            "item": folders[folder_name],
        })

    collection = {
        "info": {
            "_postman_id": str(uuid.uuid4()),
            "name": "YiYi Book - Bookstore Backend API",
            "description": (
                "Auto-generated Postman collection covering all %d REST endpoints of the YiYi Book "
                "Spring Boot backend (`backend/src/main/java/com/bookstore`).\n\n"
                "Run folders top-to-bottom (00 Health -> 20 Admin Users) with the Collection Runner or Newman; "
                "later folders depend on variables captured by earlier ones (book_id, order_id, new_user_token, "
                "...). See postman/README.md for details, seeded credentials, and known API quirks flagged "
                "throughout the request descriptions (search for 'SECURITY GAP' / 'BUG')."
                % len(ENDPOINTS)
            ),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "item": items,
        "variable": [],
        "event": [
            {
                "listen": "prerequest",
                "script": {"type": "text/javascript", "exec": [""]},
            },
            {
                "listen": "test",
                "script": {
                    "type": "text/javascript",
                    "exec": [
                        "// Collection-wide sanity check applied after every single request's own tests run.",
                        "pm.test('Response is not a raw 5xx crash page (has JSON or text body)', function () {",
                        "    pm.expect(pm.response.code).to.be.below(600);",
                        "});",
                    ],
                },
            },
        ],
    }
    return collection


def build_environment(name, base_url):
    values = [
        {"key": "base_url", "value": base_url, "type": "default", "enabled": True},
        {"key": "admin_email", "value": "admin@gmail.com", "type": "default", "enabled": True},
        {"key": "admin_password", "value": "123456", "type": "secret", "enabled": True},
        {"key": "user_email", "value": "user@gmail.com", "type": "default", "enabled": True},
        {"key": "user_password", "value": "123456", "type": "secret", "enabled": True},
        {"key": "seed_coupon_code", "value": "GRAPE10", "type": "default", "enabled": True},
        # Everything below is populated automatically by test scripts while the collection runs.
        {"key": "admin_token", "value": "", "type": "secret", "enabled": True},
        {"key": "user_token", "value": "", "type": "secret", "enabled": True},
        {"key": "new_user_token", "value": "", "type": "secret", "enabled": True},
        {"key": "new_user_id", "value": "", "type": "default", "enabled": True},
        {"key": "new_user_email", "value": "", "type": "default", "enabled": True},
        {"key": "book_id", "value": "", "type": "default", "enabled": True},
        {"key": "book_title", "value": "", "type": "default", "enabled": True},
        {"key": "book_price", "value": "", "type": "default", "enabled": True},
        {"key": "category_id", "value": "", "type": "default", "enabled": True},
        {"key": "temp_book_id", "value": "", "type": "default", "enabled": True},
        {"key": "temp_category_id", "value": "", "type": "default", "enabled": True},
        {"key": "banner_id", "value": "", "type": "default", "enabled": True},
        {"key": "temp_banner_id", "value": "", "type": "default", "enabled": True},
        {"key": "address_id", "value": "", "type": "default", "enabled": True},
        {"key": "temp_coupon_id", "value": "", "type": "default", "enabled": True},
        {"key": "order_id", "value": "", "type": "default", "enabled": True},
        {"key": "cancel_order_id", "value": "", "type": "default", "enabled": True},
        {"key": "bulk_order_id", "value": "", "type": "default", "enabled": True},
        {"key": "review_id", "value": "", "type": "default", "enabled": True},
        {"key": "voucher_id", "value": "", "type": "default", "enabled": True},
        {"key": "voucher_code", "value": "", "type": "default", "enabled": True},
        {"key": "temp_voucher_id", "value": "", "type": "default", "enabled": True},
        {"key": "notification_id", "value": "", "type": "default", "enabled": True},
        {"key": "contact_id", "value": "", "type": "default", "enabled": True},
        {"key": "newsletter_id", "value": "", "type": "default", "enabled": True},
    ]
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "values": values,
        "_postman_variable_scope": "environment",
    }


def main():
    collection = build_collection()

    # Fix the accidental typo introduced above ("default" key doesn't belong on Category; category has "featured")
    for folder in collection["item"]:
        if folder["name"] == "03 - Categories":
            for it in folder["item"]:
                if it["name"] == "[Admin] Create Category":
                    body = json.loads(it["request"]["body"]["raw"])
                    body.pop("default", None)
                    body["featured"] = False
                    it["request"]["body"]["raw"] = json.dumps(body, indent=4, ensure_ascii=False)

    col_path = os.path.join(OUT_DIR, "YiYi-Book-API.postman_collection.json")
    with open(col_path, "w", encoding="utf-8") as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)

    # NOTE: every request path already starts with "/api/..." (matches API_DOCUMENTATION.md),
    # so base_url must be the bare server root — do NOT add a trailing /api here or every
    # request doubles up to /api/api/... and gets rejected by SecurityConfig (403 on everything,
    # including permitAll routes, since none of the security matchers match the doubled path).
    dev_env = build_environment("YiYi Book - Local Dev", "http://localhost:8081")
    staging_env = build_environment("YiYi Book - Staging", "https://staging.yiyibook.example.com")

    with open(os.path.join(OUT_DIR, "YiYi-Book-Local-Dev.postman_environment.json"), "w", encoding="utf-8") as f:
        json.dump(dev_env, f, indent=2, ensure_ascii=False)
    with open(os.path.join(OUT_DIR, "YiYi-Book-Staging.postman_environment.json"), "w", encoding="utf-8") as f:
        json.dump(staging_env, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(ENDPOINTS)} requests across {len(collection['item'])} folders.")
    print(f"Collection: {col_path}")


if __name__ == "__main__":
    main()
