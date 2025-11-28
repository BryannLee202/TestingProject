// Đảm bảo biến API_BASE đã có (thường nằm trong api.js, nếu chưa thì khai báo lại ở đây)
// const API_BASE = "http://localhost:5000/api";

// --- BIẾN TOÀN CỤC ---
let currentCategoryId = null; // Lưu danh mục đang chọn (cho trang tìm kiếm)

// Biến cho phần "Gợi ý hôm nay"
let dailyHomeCurrentPage = 1;
let dailyHomeCurrentTab = "all";
let isDailyHomeLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Kiểm tra đăng nhập
  if (typeof checkLogin === "function") checkLogin();

  // 2. Tải danh mục vào sidebar & Header
  loadCategories();
  loadHeaderCategories();

  // 3. Tải danh sách sách chính (Trang tìm kiếm/Mặc định)
  loadBooks();

  // 4. Tải Flash Sale (Trang chủ)
  loadHomeFlashSale();

  // 5. Tải Gợi ý hôm nay (Trang chủ - Tab mặc định 'all')
  loadHomeDailyData("all");
});

/* ==============================================
   PHẦN 1: LOGIC TÌM KIẾM & DANH SÁCH CHÍNH
   ============================================== */

async function loadBooks(params = {}) {
  const container = document.getElementById("book-list");
  if (!container) return; // Nếu không ở trang có book-list thì bỏ qua

  container.innerHTML =
    '<p style="text-align:center; width:100%">⏳ Đang tìm kiếm...</p>';

  try {
    const url = new URL(`${API_BASE}/books`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== "") {
        url.searchParams.append(key, params[key]);
      }
    });

    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      renderBooks(data.data);
    } else {
      container.innerHTML = `<div style='text-align:center; width:100%; padding: 50px;'>❌ Không tìm thấy cuốn sách nào.</div>`;
    }
  } catch (err) {
    console.error("Lỗi:", err);
  }
}
/* ==============================================
   PHẦN XỬ LÝ TÌM KIẾM
   ============================================== */

// 1. Hàm xử lý khi nhấn nút Tìm kiếm
function handleSearch() {
  const keyword = document.getElementById("search-input").value;

  // Lấy thêm các bộ lọc hiện tại (nếu có) để tìm kiếm chính xác hơn
  const priceFilter = document.getElementById("price-filter")?.value;
  const params = {};

  // Thêm từ khóa vào tham số gửi đi
  if (keyword.trim()) {
    params.search = keyword.trim();
  }

  // Giữ nguyên lọc giá nếu đang chọn
  if (priceFilter) {
    const [min, max] = priceFilter.split("-");
    params.min_price = min;
    params.max_price = max;
  }

  // Giữ nguyên danh mục nếu đang chọn
  if (currentCategoryId) {
    params.category = currentCategoryId;
  }

  console.log("Đang tìm kiếm:", params);

  // Gọi hàm loadBooks để tải lại danh sách
  loadBooks(params);

  // Tự động cuộn xuống phần danh sách sách
  const bookList = document.getElementById("main-content"); // Hoặc ID của container chứa sách
  if (bookList) {
    bookList.scrollIntoView({ behavior: "smooth" });
  }
}

// 2. Hàm xử lý khi nhấn phím Enter trong ô input
function handleEnterSearch(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Ngăn load lại trang
    handleSearch(); // Gọi hàm tìm kiếm
  }
}

function renderBooks(books) {
  const container = document.getElementById("book-list");
  if (!books || books.length === 0) {
    container.innerHTML =
      "<div style='text-align:center; width:100%; padding: 50px;'>❌ Không tìm thấy cuốn sách nào.</div>";
    return;
  }
  container.innerHTML = generateBookHTML(books);
}

/* ==============================================
   PHẦN 2: LOGIC FLASH SALE (TRANG CHỦ)
   ============================================== */

async function loadHomeFlashSale() {
  const container = document.getElementById("home-flash-sale-grid");
  if (!container) return;

  try {
    // Gọi API Flash Sale
    const res = await fetch(`${API_BASE}/books/flash-sale`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      // Lấy 5 cuốn đầu tiên
      renderHomeFlashSale(data.data.slice(0, 5));
    } else {
      container.innerHTML =
        '<p style="padding:20px">Chưa có chương trình Flash Sale.</p>';
    }
  } catch (error) {
    console.error("Lỗi Flash Sale:", error);
  }
}

// fe/js/index.js

function renderHomeFlashSale(books) {
    const container = document.getElementById("home-flash-sale-grid");
    const formatMoney = (val) => new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'}).format(val);

    const html = books.map(book => {
        const originalPrice = book.original_price || (book.price * 1.3);
        const discount = Math.round(((originalPrice - book.price) / originalPrice) * 100);
        // Random số lượng đã bán từ 5 đến 90%
        const soldPercent = Math.floor(Math.random() * 85) + 5; 
        const soldQty = Math.floor(Math.random() * 100) + 10;

        return `
        <div class="fs-card-compact">
            <div class="fs-badge">-${discount}%</div>
            
            <a href="pages/detail.html?id=${book.id}" class="fs-img-container">
                <img src="${book.image_url}" alt="${book.title}" 
                     onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="fs-card-info">
                <a href="pages/detail.html?id=${book.id}" title="${book.title}" style="text-decoration:none">
                    <h3 class="fs-name">${book.title}</h3>
                </a>
                
                <div class="fs-price-row">
                    <div class="fs-price">${formatMoney(book.price)}</div>
                    <div class="fs-old-price">${formatMoney(originalPrice)}</div>
                </div>

                <div class="fs-progress-bar">
                    <div class="fs-progress-fill" style="width: ${soldPercent}%"></div>
                    <div class="fs-progress-text">ĐÃ BÁN ${soldQty}</div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/* ==============================================
   PHẦN 3: LOGIC GỢI Ý HÔM NAY (TRANG CHỦ)
   ============================================== */

// 3.1. Chuyển Tab
function switchHomeTab(type, btn) {
  // Đổi giao diện nút active
  document
    .querySelectorAll(".d-tab")
    .forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");

  // Reset dữ liệu
  dailyHomeCurrentTab = type;
  dailyHomeCurrentPage = 1;
  document.getElementById("home-daily-grid").innerHTML = ""; // Xóa cũ

  // Reset nút xem thêm
  const btnLoad = document.getElementById("btn-home-load-more");
  if (btnLoad) {
    btnLoad.innerHTML =
      'Xem thêm 20 sản phẩm <i class="fas fa-chevron-down"></i>';
    btnLoad.disabled = false;
    btnLoad.style.opacity = "1";
  }

  // Tải mới
  loadHomeDailyData(type);
}

// 3.2. Tải dữ liệu từ API
async function loadHomeDailyData(type) {
  const container = document.getElementById("home-daily-grid");
  if (!container) return;

  if (isDailyHomeLoading) return;
  isDailyHomeLoading = true;

  // Hiển thị loading nếu là trang 1
  if (dailyHomeCurrentPage === 1) {
    container.innerHTML =
      '<div style="grid-column:1/-1; text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Đang tìm sách hay...</div>';
  }

  try {
    // Xây dựng URL
    let url = `${API_BASE}/books?page=${dailyHomeCurrentPage}&limit=10`;

    if (type === "hot")
      url += "&min_price=100000"; // Giả lập sách hot là sách đắt tiền
    else if (type === "manga")
      url += "&category=5"; // ⚠️ ID Manga (Sửa theo DB của bạn)
    else if (type === "vanhoc") url += "&category=1"; // ⚠️ ID Văn học (Sửa theo DB của bạn)

    const res = await fetch(url);
    const data = await res.json();

    // Xóa loading icon trước khi render
    if (dailyHomeCurrentPage === 1) container.innerHTML = "";

    if (data.success && data.data.length > 0) {
      renderHomeDailyGrid(data.data);
      dailyHomeCurrentPage++; // Tăng trang
    } else {
      // Hết dữ liệu
      const btnLoad = document.getElementById("btn-home-load-more");
      if (btnLoad) {
        btnLoad.innerHTML = "Đã xem hết sản phẩm";
        btnLoad.disabled = true;
        btnLoad.style.opacity = "0.6";
      }
      if (dailyHomeCurrentPage === 1) {
        container.innerHTML =
          '<div style="grid-column:1/-1; text-align:center;">Chưa có sách mục này.</div>';
      }
    }
  } catch (error) {
    console.error("Lỗi Daily:", error);
  } finally {
    isDailyHomeLoading = false;
  }
}

// 3.3. Vẽ Giao Diện Gợi Ý
function renderHomeDailyGrid(books) {
  const container = document.getElementById("home-daily-grid");
  const html = generateBookHTML(books);
  container.insertAdjacentHTML("beforeend", html); // Thêm vào cuối (không xóa cũ)
}

// 3.4. Xử lý nút Xem Thêm
function loadMoreHomeDaily() {
  const btn = document.getElementById("btn-home-load-more");
  const oldText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';

  // Gọi lại hàm tải dữ liệu (nó sẽ tự dùng page tiếp theo)
  loadHomeDailyData(dailyHomeCurrentTab).then(() => {
    if (!btn.disabled) btn.innerHTML = oldText;
  });
}

/* ==============================================
   PHẦN 4: CÁC HÀM HỖ TRỢ CHUNG (HELPER)
   ============================================== */

// Hàm tạo HTML cho sách (Dùng chung cho cả Flash Sale, Daily, Main List)
function generateBookHTML(books, isFlashSale = false) {
  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return books
    .map((book) => {
      const originalPrice = book.original_price || book.price * 1.2;
      const discount = Math.round(
        ((originalPrice - book.price) / originalPrice) * 100
      );
      const soldQty = Math.floor(Math.random() * 50) + 5;

      let progressBarHTML = "";
      if (isFlashSale) {
        progressBarHTML = `
            <div class="progress-bar" style="height:16px; background:#fddccb; border-radius:10px; margin-top:8px; position:relative; overflow:hidden;">
                <div style="width:${soldQty}%; background:#E30019; height:100%;"></div>
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:10px; color:#fff; font-weight:bold; white-space:nowrap;">
                    ĐÃ BÁN ${soldQty}
                </div>
            </div>`;
      }

      return `
        <div class="product-card" style="min-width: 200px;">
            <div class="badge-hot">-${discount}%</div>
            
            <a href="pages/detail.html?id=${book.id}">
                <img src="${book.image_url}" alt="${book.title}" 
                     style="height:180px; width:100%; object-fit:contain; margin-bottom:10px;"
                     onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <a href="pages/detail.html?id=${book.id}" title="${book.title}">
                <h3 style="font-size:13px; margin:0 0 5px; height:40px; overflow:hidden; line-height:1.4; color:#333;">${
                  book.title
                }</h3>
            </a>
            
            <div class="rating-area" style="font-size:10px; color:#F7941E; margin-bottom:5px;">
                ${renderStars(book.average_rating || 5)}
                <span style="color:#999;">(${book.review_count || 0})</span>
            </div>

            <div style="display:flex; gap:8px; align-items:center;">
                <div class="price" style="color:#C92127; font-size:16px; font-weight:bold;">${formatMoney(
                  book.price
                )}</div>
                <div class="original-price" style="text-decoration:line-through; color:#999; font-size:12px;">${formatMoney(
                  originalPrice
                )}</div>
            </div>

            ${progressBarHTML}

            <button class="btn-add-cart" onclick="addToCart(${
              book.id
            })" style="margin-top:10px; width:100%;">
                <i class="fas fa-cart-plus"></i> Thêm vào giỏ
            </button>
        </div>
        `;
    })
    .join("");
}

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars += '<i class="fas fa-star"></i>';
    else stars += '<i class="far fa-star"></i>';
  }
  return stars;
}

// Các hàm khác (addToCart, loadCategories, selectCategory...) giữ nguyên như cũ
// ... (Bạn copy lại các hàm đó vào đây nếu cần, hoặc để chúng ở cuối file này)

async function addToCart(bookId) {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: "Đăng nhập",
      text: "Bạn cần đăng nhập để mua hàng.",
      icon: "warning",
      confirmButtonText: "Đồng ý",
    });
    return;
  }
  // ... Logic add cart cũ ...
  console.log("Add cart", bookId);
  Swal.fire({
    title: "Thành công!",
    text: "Đã thêm vào giỏ hàng!",
    icon: "success",
    timer: 1000,
    showConfirmButton: false,
  });
}

async function loadCategories() {
  // ... Logic load category sidebar cũ ...
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    const listDiv = document.getElementById("category-filter-list");
    if (data.success && listDiv) {
      listDiv.innerHTML = data.data
        .map(
          (cat) => `
                <a href="javascript:void(0)" class="category-link" onclick="selectCategory(event, this, ${cat.id})">${cat.name}</a>
            `
        )
        .join("");
    }
  } catch (e) {}
}

async function loadHeaderCategories() {
  // ... Logic load category header cũ ...
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    const menuContainer = document.getElementById("header-category-list");
    if (data.success && menuContainer) {
      menuContainer.innerHTML = data.data
        .map(
          (cat) => `
                <a href="javascript:void(0)" class="cate-menu-item" onclick="handleHeaderCategoryClick(event, ${cat.id})">
                    <i class="fas fa-book"></i> <span>${cat.name}</span>
                </a>
            `
        )
        .join("");
    }
  } catch (e) {}
}

function selectCategory(event, element, id) {
  if (event) event.preventDefault();
  currentCategoryId = id;
  applyFilters();
}

function applyFilters() {
  const params = {};
  if (currentCategoryId) params.category = currentCategoryId;
  loadBooks(params);
}

function handleHeaderCategoryClick(event, catId) {
  event.preventDefault();
  // Logic scroll xuống và lọc
  currentCategoryId = catId;
  applyFilters();
  document
    .getElementById("main-content")
    ?.scrollIntoView({ behavior: "smooth" });
}
/* ==============================================
   PHẦN GỢI Ý TÌM KIẾM (AUTOCOMPLETE)
   ============================================== */

let searchTimeout = null; // Biến để lưu bộ đếm thời gian

// 1. Hàm xử lý khi người dùng gõ phím
function handleInputSearch(keyword) {
  const suggestionBox = document.getElementById("search-suggestions-box");

  // Nếu xóa hết chữ thì ẩn gợi ý
  if (!keyword.trim()) {
    suggestionBox.style.display = "none";
    suggestionBox.innerHTML = "";
    return;
  }

  // Xóa bộ đếm cũ (Debounce - Chống spam API)
  clearTimeout(searchTimeout);

  // Đợi 300ms sau khi ngừng gõ mới gọi API
  searchTimeout = setTimeout(() => {
    fetchSearchSuggestions(keyword);
  }, 300);
}

// 2. Gọi API tìm kiếm nhanh
async function fetchSearchSuggestions(keyword) {
  const suggestionBox = document.getElementById("search-suggestions-box");

  try {
    // Gọi API tìm kiếm (tái sử dụng API books)
    const res = await fetch(`${API_BASE}/books?search=${keyword}&limit=5`); // Chỉ lấy 5 kết quả
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderSuggestions(data.data);
      suggestionBox.style.display = "block";
    } else {
      // Không tìm thấy
      suggestionBox.style.display = "none";
    }
  } catch (error) {
    console.error("Lỗi gợi ý:", error);
  }
}

// 3. Vẽ danh sách gợi ý
function renderSuggestions(books) {
  const suggestionBox = document.getElementById("search-suggestions-box");
  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const html = books
    .map(
      (book) => `
        <a href="pages/detail.html?id=${book.id}" class="suggestion-item">
            <img src="${
              book.image_url
            }" onerror="this.src='https://via.placeholder.com/100'">
            <div class="suggestion-info">
                <h4>${book.title}</h4>
                <div class="price">${formatMoney(book.price)}</div>
            </div>
        </a>
    `
    )
    .join("");

  suggestionBox.innerHTML = html;
}

// 4. Sự kiện: Bấm ra ngoài thì tắt bảng gợi ý
document.addEventListener("click", function (e) {
  const searchBar = document.querySelector(".search-bar");
  const suggestionBox = document.getElementById("search-suggestions-box");

  if (searchBar && !searchBar.contains(e.target)) {
    suggestionBox.style.display = "none";
  }
});
