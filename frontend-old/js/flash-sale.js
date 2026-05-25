// fe/js/flash-sale.js

const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  loadFlashSaleBooks(); // Gọi API thật
  startTimer(); // Chạy đồng hồ đếm ngược
});

// 1. TẢI SÁCH TỪ SERVER
async function loadFlashSaleBooks() {
  const container = document.getElementById("flash-sale-grid");
  container.innerHTML =
    '<div style="color:#fff; grid-column:1/-1; text-align:center;">⏳ Đang săn deal hot...</div>';

  try {
    // Gọi API mà ta vừa tạo ở Backend
    const res = await fetch(`${API_BASE_URL}/books/flash-sale`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderFlashSaleGrid(data.data);
    } else {
      container.innerHTML =
        '<div style="color:#fff">Hết hàng Flash Sale!</div>';
    }
  } catch (e) {
    console.error("Lỗi:", e);
    container.innerHTML = '<div style="color:#fff">Lỗi kết nối Server!</div>';
  }
}

// 2. VẼ GIAO DIỆN (Render)
function renderFlashSaleGrid(books) {
  const container = document.getElementById("flash-sale-grid");
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  container.innerHTML = books
    .map((book) => {
      // Nếu DB chưa có original_price, tự giả lập giá gốc cao hơn 30%
      const originalPrice = book.original_price || book.price * 1.3;
      const discount = Math.round(
        ((originalPrice - book.price) / originalPrice) * 100
      );
      const soldQty = Math.floor(Math.random() * 90) + 10; // Random số đã bán

      return `
        <div class="fs-product-card">
            <div class="badge-percent">-${discount}%</div>
            
            <a href="../pages/detail.html?id=${book.id}" class="fs-img-wrap">
                <img src="${
                  book.image_url
                }" onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="fs-title">${book.title}</div>
            
            <div class="fs-price-row">
                <div class="fs-price">${formatMoney(book.price)}</div>
                <div class="fs-old-price">${formatMoney(originalPrice)}</div>
            </div>

            <div class="fs-progress">
                <div class="fs-progress-bar" style="width: ${soldQty}%"></div>
                <div class="fs-progress-text">Đã bán ${soldQty}</div>
            </div>

            <button class="btn-fs-buy" onclick="addToCart(${
              book.id
            })">Thêm vào giỏ</button>
        </div>
        `;
    })
    .join("");
}

// 3. ĐẾM NGƯỢC (Giữ nguyên logic cũ)
function startTimer() {
  let time = 7200 + 5400;
  setInterval(() => {
    time--;
    if (time < 0) time = 10000;

    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;

    const elH = document.getElementById("fs-h") || document.getElementById("h");
    const elM = document.getElementById("fs-m") || document.getElementById("m");
    const elS = document.getElementById("fs-s") || document.getElementById("s");

    if (elH) elH.innerText = h.toString().padStart(2, "0");
    if (elM) elM.innerText = m.toString().padStart(2, "0");
    if (elS) elS.innerText = s.toString().padStart(2, "0");
  }, 1000);
}
