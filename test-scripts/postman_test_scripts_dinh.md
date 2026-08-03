# 📋 Postman Test Scripts — Văn Đỉnh (Member 4)
# YiYi Bookstore API Collection

> Copy từng block script vào tab **Tests** của từng request tương ứng trong Postman.

---

## 📁 1. AUTH

### POST /auth/register
```javascript
pm.test("✅ Status 201 Created", () => {
    pm.response.to.have.status(201);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("📦 Response có đủ field", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("email");
    pm.expect(json).to.have.property("fullName");
});
pm.test("📧 Email trả về đúng format", () => {
    const json = pm.response.json();
    pm.expect(json.email).to.be.a("string").and.include("@");
});
```

---

### POST /auth/login
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("🔑 Response có token", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("token");
    pm.expect(json.token).to.be.a("string").and.not.empty;
});
pm.test("👤 Response có thông tin user", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("user");
    pm.expect(json.user).to.have.property("id");
    pm.expect(json.user).to.have.property("email");
});
// ✅ Lưu token và userId để chain sang request khác
const json = pm.response.json();
if (json.token) {
    pm.environment.set("token", json.token);
}
if (json.user && json.user.id) {
    pm.environment.set("userId", json.user.id);
}
```

---

### POST /auth/logout
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.environment.unset("token");
```

---

### POST /auth/refresh
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("🔑 Có token mới", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("token");
});
const json = pm.response.json();
if (json.token) {
    pm.environment.set("token", json.token);
}
```

---

## 📁 2. BOOKS

### GET /books
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("📚 Response là array sách", () => {
    const json = pm.response.json();
    const books = Array.isArray(json) ? json : (json.content || json.data || []);
    pm.expect(books).to.be.an("array");
});
pm.test("📖 Mỗi sách có đủ field", () => {
    const json = pm.response.json();
    const books = Array.isArray(json) ? json : (json.content || json.data || []);
    if (books.length > 0) {
        pm.expect(books[0]).to.have.property("id");
        pm.expect(books[0]).to.have.property("title");
        pm.expect(books[0]).to.have.property("price");
    }
});
```

---

### GET /books/{id}
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("📖 Sách có đủ field chi tiết", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("title");
    pm.expect(json).to.have.property("author");
    pm.expect(json).to.have.property("price");
    pm.expect(json).to.have.property("stock");
});
pm.test("💰 Giá sách > 0", () => {
    const json = pm.response.json();
    pm.expect(json.price).to.be.a("number").and.above(0);
});
// Lưu bookId
const json = pm.response.json();
if (json.id) { pm.environment.set("bookId", json.id); }
```

---

### GET /books/search
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("🔍 Kết quả tìm kiếm đúng định dạng", () => {
    const json = pm.response.json();
    const results = Array.isArray(json) ? json : (json.content || json.data || []);
    pm.expect(results).to.be.an("array");
});
```

---

### POST /books (Admin)
```javascript
pm.test("✅ Status 201 Created", () => {
    pm.response.to.have.status(201);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("📚 Sách mới có đủ field", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("title");
    pm.expect(json).to.have.property("price");
});
const json = pm.response.json();
if (json.id) { pm.environment.set("newBookId", json.id); }
```

---

### DELETE /books/{id} (Admin)
```javascript
pm.test("✅ Status 200 hoặc 204", () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 204]);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

## 📁 3. CART

### GET /cart
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("🛒 Giỏ hàng có đủ field", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("items");
    pm.expect(json.items).to.be.an("array");
});
const json = pm.response.json();
if (json.id) { pm.environment.set("cartId", json.id); }
```

---

### POST /cart/items
```javascript
pm.test("✅ Status 200 hoặc 201", () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("➕ Item được thêm vào giỏ", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("items");
    pm.expect(json.items).to.be.an("array").and.not.empty;
});
const json = pm.response.json();
if (json.items && json.items.length > 0) {
    pm.environment.set("cartItemId", json.items[json.items.length - 1].id);
}
```

---

### PUT /cart/items/{id}
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("🔄 Cart được trả về sau update", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("items");
});
```

---

### DELETE /cart/items/{id}
```javascript
pm.test("✅ Status 200 hoặc 204", () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 204]);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

## 📁 4. ORDERS

### POST /orders
```javascript
pm.test("✅ Status 201 Created", () => {
    pm.response.to.have.status(201);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("📦 Đơn hàng mới có đủ field", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("status");
    pm.expect(json).to.have.property("totalAmount");
    pm.expect(json).to.have.property("paymentMethod");
});
pm.test("📊 Status đơn hàng hợp lệ", () => {
    const json = pm.response.json();
    const validStatuses = ["PENDING", "PENDING_PAYMENT", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];
    pm.expect(validStatuses).to.include(json.status);
});
const json = pm.response.json();
if (json.id) { pm.environment.set("orderId", json.id); }
```

---

### GET /orders
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("📋 Danh sách đơn hàng đúng định dạng", () => {
    const json = pm.response.json();
    const orders = Array.isArray(json) ? json : (json.content || json.data || []);
    pm.expect(orders).to.be.an("array");
});
```

---

### GET /orders/{id}
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("📦 Chi tiết đơn hàng có đủ field", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("status");
    pm.expect(json).to.have.property("totalAmount");
    pm.expect(json).to.have.property("items");
    pm.expect(json.items).to.be.an("array");
});
```

---

### PUT /orders/{id}/cancel
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("❌ Đơn hàng đã được hủy", () => {
    const json = pm.response.json();
    pm.expect(json.status).to.equal("CANCELLED");
});
```

---

## 📁 5. PAYMENT

### POST /payment/vnpay/create
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("💳 Có payment URL", () => {
    const json = pm.response.json();
    const hasUrl = json.paymentUrl || json.url || json.redirectUrl;
    pm.expect(hasUrl).to.exist;
});
```

---

### POST /payment/momo/create
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("💜 MoMo có payUrl", () => {
    const json = pm.response.json();
    const hasUrl = json.payUrl || json.paymentUrl || json.url;
    pm.expect(hasUrl).to.exist;
});
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("💚 ZaloPay response hợp lệ", () => {
    const json = pm.response.json();
    pm.expect(json).to.exist;
});
```

---

## 📁 6. REVIEWS ⭐ (Phần của Đỉnh)

### GET /reviews/book/{bookId}
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("⭐ Danh sách reviews đúng định dạng", () => {
    const json = pm.response.json();
    const reviews = Array.isArray(json) ? json : (json.content || json.data || []);
    pm.expect(reviews).to.be.an("array");
});
pm.test("📝 Mỗi review có đủ field", () => {
    const json = pm.response.json();
    const reviews = Array.isArray(json) ? json : (json.content || json.data || []);
    if (reviews.length > 0) {
        pm.expect(reviews[0]).to.have.property("id");
        pm.expect(reviews[0]).to.have.property("rating");
        pm.expect(reviews[0]).to.have.property("comment");
    }
});
```

---

### GET /reviews/my-reviews
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("⭐ List reviews cá nhân trả về array", () => {
    const json = pm.response.json();
    pm.expect(json).to.be.an("array");
});
```

---

### POST /reviews/book/{bookId}
```javascript
pm.test("✅ Status 200 hoặc 201", () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("⭐ Review mới có đủ field", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("rating");
    pm.expect(json).to.have.property("comment");
});
pm.test("🌟 Rating trong khoảng 1–5", () => {
    const json = pm.response.json();
    pm.expect(json.rating).to.be.within(1, 5);
});
const json = pm.response.json();
if (json.id) { pm.environment.set("reviewId", json.id); }
```

---

### POST /reviews/{reviewId}/like
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("👍 Review sau khi like có đủ thông tin", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
});
```

---

### POST /reviews/{reviewId}/comments
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("💬 Comment mới tạo có content", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("id");
    pm.expect(json).to.have.property("content");
});
```

---

### POST /reviews/{reviewId}/report
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

### GET /reviews/check-eligibility/{bookId}
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("🔍 Trả về field eligible", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("eligible");
});
```

---

## 📁 7. WISHLIST

### GET /wishlists
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("💝 Wishlist trả về danh sách array", () => {
    const json = pm.response.json();
    const items = Array.isArray(json) ? json : (json.content || json.data || []);
    pm.expect(items).to.be.an("array");
});
```

---

### POST /wishlists/book/{bookId} (Toggle Wishlist)
```javascript
pm.test("✅ Status 200 OK", () => {
    pm.response.to.have.status(200);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
pm.test("💝 Trả về message và trạng thái isLiked", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("message");
    pm.expect(json).to.have.property("isLiked");
    pm.expect(json.isLiked).to.be.a("boolean");
});
```

---

## ⚠️ Error Cases (Bắt buộc phải test!)

### 401 Unauthorized (gọi API không có token)
```javascript
pm.test("🚫 Status 401 khi không có token", () => {
    pm.response.to.have.status(401);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

### 404 Not Found (ID không tồn tại, vd: /books/99999)
```javascript
pm.test("🔍 Status 404 khi ID không tồn tại", () => {
    pm.response.to.have.status(404);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

### 400 Bad Request (body thiếu hoặc sai format)
```javascript
pm.test("❌ Status 400 khi body không hợp lệ", () => {
    pm.response.to.have.status(400);
});
pm.test("⏱ Response time < 2000ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

## 🎯 Checklist Hoàn Thành

- [ ] Auth: register, login, logout, refresh
- [ ] Books: GET list, GET detail, GET search, POST, PUT, DELETE
- [ ] Cart: GET, POST item, PUT item, DELETE item
- [ ] Orders: POST, GET list, GET detail, PUT cancel
- [ ] Payment: VNPay, MoMo, ZaloPay
- [ ] **Reviews: GET list, GET my, POST, LIKE, COMMENT, REPORT, ELIGIBILITY** ← phần của Đỉnh
- [ ] Wishlist: GET, TOGGLE
- [ ] **Coupons: GET, POST apply** ← phần của Đỉnh
- [ ] **Notifications: GET, PUT** ← phần của Đỉnh
- [ ] **Newsletter: POST subscribe** ← phần của Đỉnh
- [ ] Error cases: 401, 404, 400
