// Đảm bảo đúng port 5000 như trong server.js
const API_BASE = "http://localhost:5000/api";

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );
const getToken = () => localStorage.getItem("token");

// Hàm chạy mỗi khi vào trang
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderUser();
  updateCartCount();
});

// Cập nhật Header
// Cập nhật Header
function updateHeaderUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authDisplay = document.getElementById("auth-display");
  const userDropdown = document.getElementById("user-dropdown");

  if (!authDisplay || !userDropdown) return;

  if (user) {
    // Đã đăng nhập - HIỂN THỊ MENU PROFILE
    authDisplay.innerHTML = `
      <i class="fas fa-user-circle" style="font-size:20px; color:#28a745"></i>
      <div class="user-info">
          <span style="font-weight:bold;">${user.name || "Khách hàng"}</span>
          <small style="font-size:11px; color:#777">Tài khoản</small>
      </div>
    `;

    userDropdown.innerHTML = `
      <a href="pages/profile.html" class="menu-link">
        <i class="fas fa-user-circle"></i> Hồ sơ của tôi
      </a>
      <a href="pages/orders.html" class="menu-link">
        <i class="fas fa-shopping-bag"></i> Đơn hàng
      </a>
      <a href="pages/wishlist.html" class="menu-link">
        <i class="fas fa-heart"></i> Yêu thích
      </a>
      <hr style="margin: 5px 0; border-color: #eee;">
      <a href="javascript:void(0)" class="menu-link" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i> Đăng xuất
      </a>
    `;
  } else {
    // Chưa đăng nhập
    authDisplay.innerHTML = `
      <i class="far fa-user"></i>
      <div class="user-info">
          <span style="font-weight:bold; font-size:13px">Tài khoản</span>
          <small style="font-size:11px; color:#777">Đăng nhập / Đăng ký</small>
      </div>
    `;

    userDropdown.innerHTML = `
      <a href="pages/login.html" class="menu-link">
        <i class="fas fa-sign-in-alt"></i> Đăng nhập
      </a>
      <a href="pages/register.html" class="menu-link">
        <i class="fas fa-user-plus"></i> Đăng ký
      </a>
    `;
  }
}
// Cập nhật số lượng giỏ hàng
async function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const token = getToken();
  if (!token) {
    badge.innerText = "0";
    badge.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    // fallback cart
    const cartItems = data.data || data.cart || [];
    const count = Array.isArray(cartItems) ? cartItems.length : 0;

    badge.innerText = count;
    badge.style.display = count > 0 ? "block" : "none";
  } catch (e) {
    console.error("Lỗi load giỏ hàng:", e);
    badge.innerText = "0";
    badge.style.display = "none";
  }
}
// Hàm đăng xuất
function logout() {
  Swal.fire({
    title: "Đăng xuất?",
    text: "Bạn có chắc chắn muốn đăng xuất?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#C92127",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Hủy",
  }).then((result) => {
    if (result.isConfirmed) {
      // Xóa token và user khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Cập nhật header
      updateHeaderUser();
      updateCartCount();

      // Hiển thị thông báo
      Swal.fire({
        title: "Đã đăng xuất!",
        text: "Bạn đã đăng xuất thành công.",
        icon: "success",
        confirmButtonColor: "#C92127",
        timer: 1500,
      }).then(() => {
        // Chuyển về trang chủ
        window.location.href = "index.html";
      });
    }
  });
}
