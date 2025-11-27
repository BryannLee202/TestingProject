// Đảm bảo biến API_BASE đã có (thường nằm trong api.js, nếu chưa thì khai báo lại ở đây)
// const API_BASE = "http://localhost:5000/api";

// --- BIẾN TOÀN CỤC ---
let currentCategoryId = null; // Lưu danh mục đang chọn

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra đăng nhập (hàm này nằm bên api.js/common.js)
  if (typeof checkLogin === "function") checkLogin();

  // Tải danh mục vào sidebar
  loadCategories();

  // Tải toàn bộ sách lần đầu
  loadBooks();
});

// 1. HÀM TẢI SÁCH (CÓ HỖ TRỢ TÌM KIẾM & LỌC)
async function loadBooks(params = {}) {
  const container = document.getElementById("book-list");
  container.innerHTML =
    '<p style="text-align:center; width:100%">⏳ Đang tìm kiếm...</p>';

  try {
    // Xây dựng đường dẫn URL
    const url = new URL(`${API_BASE}/books`);

    // Thêm các tham số vào URL (search, category, min_price, max_price...)
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== "") {
        url.searchParams.append(key, params[key]);
      }
    });

    console.log("Calling API:", url.toString()); // Log để kiểm tra link

    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      renderBooks(data.data);
    } else {
      container.innerHTML = `<div style='text-align:center; width:100%; padding: 50px;'>❌ Không tìm thấy cuốn sách nào.</div>`;
    }
  } catch (err) {
    console.error("Lỗi:", err);
    container.innerHTML = `<p style="text-align:center; color:red">Lỗi kết nối Server!</p>`;
  }
}

// 2. HÀM XỬ LÝ KHI BẤM NÚT TÌM KIẾM
function handleSearch() {
  const keyword = document.getElementById("search-input").value;
  const priceFilter = document.getElementById("price-filter").value;

  // Tạo object chứa tham số để gửi lên Server
  const params = {};

  // 1. Xử lý Từ khóa
  if (keyword.trim()) {
    params.search = keyword.trim();
  }

  // 2. Xử lý Khoảng giá
  if (priceFilter) {
    const [min, max] = priceFilter.split("-");
    params.min_price = min;
    params.max_price = max;
  }

  // 3. Xử lý Thể loại (Giữ nguyên thể loại đang chọn nếu có)
  if (currentCategoryId) {
    params.category = currentCategoryId;
  }

  // Gọi lại hàm load sách với tham số mới
  loadBooks(params);
}

// 3. HÀM VẼ SÁCH RA MÀN HÌNH
function renderBooks(books) {
  const container = document.getElementById("book-list");

  if (!books || books.length === 0) {
    container.innerHTML =
      "<div style='text-align:center; width:100%; padding: 50px;'>❌ Không tìm thấy cuốn sách nào.</div>";
    return;
  }

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const html = books
    .map((book) => {
      // Giả lập giá gốc (cao hơn giá bán 20%)
      const fakeOriginalPrice = book.price * 1.2;
      const discount = Math.round(
        ((fakeOriginalPrice - book.price) / fakeOriginalPrice) * 100
      );

      return `
        <div class="product-card">
            ${discount > 0 ? `<div class="badge-hot">-${discount}%</div>` : ""}
            
            <a href="pages/detail.html?id=${book.id}">
                <img src="${
                  book.image_url || "https://via.placeholder.com/200"
                }" 
                     alt="${book.title}" 
                     onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <a href="pages/detail.html?id=${book.id}" title="${book.title}">
                <h3>${book.title}</h3>
            </a>

            <div class="rating-area">
                ${renderStars(book.average_rating || 0)}
                <span class="review-count">(${
                  book.review_count || 0
                } đánh giá)</span>
            </div>

            <div class="price">
                ${formatMoney(book.price)}
                <span class="original-price">${formatMoney(
                  fakeOriginalPrice
                )}</span>
            </div>

            <div class="card-footer">
                <button class="btn-add-cart" onclick="addToCart(${book.id})">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            </div>
        </div>
        `;
    })
    .join("");

  container.innerHTML = html;
}

// 4. HÀM VẼ NGÔI SAO (Helper)
function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars += '<i class="fas fa-star"></i>';
    else if (i - 0.5 <= rating) stars += '<i class="fas fa-star-half-alt"></i>';
    else stars += '<i class="far fa-star"></i>';
  }
  return stars;
}

// 5. HÀM THÊM GIỎ HÀNG
async function addToCart(bookId) {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: "Đăng nhập",
      text: "Bạn cần đăng nhập để mua hàng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e30019",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Đến trang Đăng nhập",
      cancelButtonText: "Để sau",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "pages/login.html";
      }
    });
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId, quantity: 1 }),
    });
    const data = await res.json();

    if (res.ok || data.success) {
      // Cập nhật icon giỏ hàng nếu hàm này tồn tại
      if (typeof updateCartCount === "function") await updateCartCount();

      Swal.fire({
        title: "Thành công!",
        text: "✅ Đã thêm vào giỏ hàng!",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } else {
      Swal.fire({
        title: "Lỗi",
        text: "Lỗi: " + data.message,
        icon: "error",
        confirmButtonColor: "#e30019",
      });
    }
  } catch (e) {
    Swal.fire({
      title: "Lỗi",
      text: "Lỗi kết nối Server!",
      icon: "error",
      confirmButtonColor: "#e30019",
    });
  }
}

// 6. HÀM TẢI DANH MỤC VÀO SIDEBAR
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();

    const listDiv = document.getElementById("category-filter-list");
    if (data.success) {
      listDiv.innerHTML = data.data
        .map(
          (cat) => `
                <a href="#" 
                   class="category-link" 
                   style="display:block; padding:5px 0; color:#333; text-decoration:none;"
                   onclick="selectCategory(event, this, ${cat.id})"> 
                   ${cat.name}
                </a>
            `
        )
        .join("");
    }
  } catch (err) {
    console.error("Lỗi danh mục:", err);
  }
}

// 7. HÀM CHỌN THỂ LOẠI (LOGIC CHÍNH)
function selectCategory(event, element, id) {
  // 🛑 QUAN TRỌNG: Ngăn chặn hành động mặc định (nhảy trang)
  if (event) event.preventDefault();

  // 1. Reset màu các link khác
  document.querySelectorAll(".category-link").forEach((el) => {
    el.style.color = "#333";
    el.style.fontWeight = "normal";
  });

  // 2. Highlight link vừa chọn
  if (element) {
    element.style.color = "#e30019";
    element.style.fontWeight = "bold";
  }

  // 3. Lưu ID vào biến toàn cục
  currentCategoryId = id;
  console.log("Đã chọn danh mục:", id);

  // 4. Gọi hàm lọc
  applyFilters();
}

// 8. HÀM ÁP DỤNG BỘ LỌC TỔNG HỢP
function applyFilters() {
  const priceValue = document.getElementById("price-filter")?.value;
  const params = {};

  // Xử lý Giá
  if (priceValue) {
    const [min, max] = priceValue.split("-");
    params.min_price = min;
    params.max_price = max;
  }

  // Xử lý Thể loại (Lấy từ biến toàn cục)
  if (currentCategoryId) {
    params.category = currentCategoryId; // Key là 'category' cho khớp Backend
  }

  console.log("Params gửi đi:", params);

  // Gọi API
  loadBooks(params);
}

// 9. HÀM RESET BỘ LỌC
function resetFilters() {
  currentCategoryId = null;
  document.getElementById("price-filter").value = "";

  document.querySelectorAll(".category-link").forEach((el) => {
    el.style.color = "#333";
    el.style.fontWeight = "normal";
  });

  loadBooks();
}
