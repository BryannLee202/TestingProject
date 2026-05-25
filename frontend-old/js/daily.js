// fe/js/daily.js

const DAILY_API = "http://localhost:5000/api";
let currentPage = 1;
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  loadDailyBooks(); // Tải trang 1 ngay khi vào
});

// 1. TẢI SÁCH (Phân trang)
async function loadDailyBooks() {
  if (isLoading) return;
  isLoading = true;

  const btn = document.getElementById("btn-load-more");
  if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';

  try {
    // Gọi API getAllBooks có sẵn, thêm tham số page & limit
    const res = await fetch(`${DAILY_API}/books?page=${currentPage}&limit=10`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderBooks(data.data); // Vẽ thêm sách vào lưới
      currentPage++; // Tăng số trang lên cho lần bấm sau

      if (btn) {
        btn.innerHTML =
          'Xem thêm 20 sản phẩm <i class="fas fa-chevron-down"></i>';
        btn.disabled = false;
      }
    } else {
      if (btn) {
        btn.innerHTML = "Đã hiển thị hết sản phẩm";
        btn.disabled = true;
        btn.style.opacity = "0.6";
      }
    }
  } catch (error) {
    console.error("Lỗi Daily:", error);
  } finally {
    isLoading = false;
  }
}

// 2. VẼ SÁCH (Append - Nối tiếp vào danh sách cũ)
function renderBooks(books) {
  const container = document.getElementById("daily-grid");
  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const html = books
    .map((book) => {
      const originalPrice = book.original_price || book.price * 1.2;
      const discount = Math.round(
        ((originalPrice - book.price) / originalPrice) * 100
      );
      const sold = Math.floor(Math.random() * 200) + 10;

      return `
        <div class="suggest-card">
            <span class="badge-discount">-${discount}%</span>
            
            <a href="../pages/detail.html?id=${book.id}" class="card-img-wrap">
                <img src="${book.image_url}" alt="${
        book.title
      }" onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="card-title" title="${book.title}">${book.title}</div>
            
            <div class="price-row">
                <div class="current-price">${formatMoney(book.price)}</div>
            </div>
            <div class="original-price">${formatMoney(originalPrice)}</div>
            
            <div style="margin-top:8px; display:flex; align-items:center;">
                <span class="rating-stars" style="color:#F7941E; font-size:10px;">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </span>
                <span class="sold-count" style="font-size:11px; color:#777; margin-left:5px;">| Đã bán ${sold}</span>
            </div>

            <button class="btn-add-cart" onclick="addToCart(${
              book.id
            })" style="width:100%; margin-top:10px; border:1px solid #C92127; background:#fff; color:#C92127; font-weight:bold; padding:5px; border-radius:4px; cursor:pointer;">
                Thêm vào giỏ
            </button>
        </div>
        `;
    })
    .join("");

  // Dùng insertAdjacentHTML để không bị xóa mất sách cũ
  container.insertAdjacentHTML("beforeend", html);
}

// 3. XỬ LÝ SỰ KIỆN NÚT LOAD MORE
// (Hàm này đã được gọi trực tiếp trong onclick của HTML: loadMoreBooks -> loadDailyBooks)
// Nhưng để khớp với tên hàm trong HTML cũ, ta gán alias:
window.loadMoreBooks = loadDailyBooks;
