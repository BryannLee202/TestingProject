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
function updateHeaderUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authDisplay = document.getElementById("auth-display");
  const userDropdown = document.getElementById("user-dropdown");

  if (!authDisplay || !userDropdown) return;

  if (user) {
    // Đã đăng nhập
    authDisplay.innerHTML = `
            <i class="fas fa-user-circle" style="font-size:20px; color:#28a745"></i>
            <div class="user-info">
                <span style="font-weight:bold;">${
                  user.name || "Khách hàng"
                }</span>
            </div>
        `;
    userDropdown.innerHTML = `
            <a href="#" class="menu-link" onclick="logout()">Đăng xuất</a>
        `;
  } else {
    // Chưa đăng nhập
    authDisplay.innerHTML = `
            <i class="far fa-user"></i>
            <div class="user-info">
                <span>Tài khoản</span>
                <small>Đăng nhập/Đăng ký</small>
            </div>
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
