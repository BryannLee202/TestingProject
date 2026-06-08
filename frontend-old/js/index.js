// fe/js/index.js

// Đảm bảo biến API_BASE đã có
// const API_BASE = "http://localhost:5000/api";

// --- BIẾN TOÀN CỤC ---
let currentCategoryId = null;
let dailyHomeCurrentPage = 1;
let dailyHomeCurrentTab = "all";
let isDailyHomeLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Kiểm tra đăng nhập (nếu có hàm này)
  if (typeof checkLogin === "function") checkLogin();

  // 2. Tải danh mục
  loadCategories();
  loadHeaderCategories();

  // 3. Tải danh sách sách
  loadBooks();

  // 4. Tải Flash Sale
  loadHomeFlashSale();

  // 5. Tải Gợi ý hôm nay
  loadHomeDailyData("all");
});

/* ==============================================
   PHẦN 1: LOGIC TÌM KIẾM & DANH SÁCH CHÍNH
   ============================================== */

async function loadBooks(params = {}) {
  const container = document.getElementById("book-list");
  if (!container) return;

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

function renderBooks(books) {
  const container = document.getElementById("book-list");
  if (!books || books.length === 0) {
    container.innerHTML =
      "<div style='text-align:center; width:100%; padding: 50px;'>❌ Không tìm thấy cuốn sách nào.</div>";
    return;
  }
  container.innerHTML = generateBookHTML(books);
}

// 1. Hàm xử lý khi nhấn nút Tìm kiếm
function handleSearch() {
  const keyword = document.getElementById("search-input").value;
  const priceFilter = document.getElementById("price-filter")?.value;
  const params = {};

  if (keyword.trim()) params.search = keyword.trim();

  if (priceFilter) {
    const [min, max] = priceFilter.split("-");
    params.min_price = min;
    params.max_price = max;
  }

  if (currentCategoryId) params.category = currentCategoryId;

  loadBooks(params);

  const bookList = document.getElementById("main-content");
  if (bookList) bookList.scrollIntoView({ behavior: "smooth" });
}

// 2. Hàm xử lý khi nhấn phím Enter
function handleEnterSearch(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
}

/* ==============================================
   PHẦN 2: LOGIC FLASH SALE
   ============================================== */

async function loadHomeFlashSale() {
  const container = document.getElementById("home-flash-sale-grid");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/books/flash-sale`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderHomeFlashSale(data.data.slice(0, 5));
    } else {
      container.innerHTML =
        '<p style="padding:20px">Chưa có chương trình Flash Sale.</p>';
    }
  } catch (error) {
    console.error("Lỗi Flash Sale:", error);
  }
}

function renderHomeFlashSale(books) {
  const container = document.getElementById("home-flash-sale-grid");
  const html = generateBookHTML(books, true); // true để hiện progress bar
  container.innerHTML = html;
}

/* ==============================================
   PHẦN 3: LOGIC GỢI Ý HÔM NAY
   ============================================== */

function switchHomeTab(type, btn) {
  document
    .querySelectorAll(".d-tab")
    .forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");

  dailyHomeCurrentTab = type;
  dailyHomeCurrentPage = 1;
  document.getElementById("home-daily-grid").innerHTML = "";

  const btnLoad = document.getElementById("btn-home-load-more");
  if (btnLoad) {
    btnLoad.innerHTML =
      'Xem thêm 20 sản phẩm <i class="fas fa-chevron-down"></i>';
    btnLoad.disabled = false;
    btnLoad.style.opacity = "1";
  }

  loadHomeDailyData(type);
}

async function loadHomeDailyData(type) {
  const container = document.getElementById("home-daily-grid");
  if (!container) return;

  if (isDailyHomeLoading) return;
  isDailyHomeLoading = true;

  if (dailyHomeCurrentPage === 1) {
    container.innerHTML =
      '<div style="grid-column:1/-1; text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Đang tìm sách hay...</div>';
  }

  try {
    let url = `${API_BASE}/books?page=${dailyHomeCurrentPage}&limit=10`;

    if (type === "hot") url += "&min_price=100000";
    else if (type === "manga") url += "&category=5";
    else if (type === "vanhoc") url += "&category=1";

    const res = await fetch(url);
    const data = await res.json();

    if (dailyHomeCurrentPage === 1) container.innerHTML = "";

    if (data.success && data.data.length > 0) {
      renderHomeDailyGrid(data.data);
      dailyHomeCurrentPage++;
    } else {
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

function renderHomeDailyGrid(books) {
  const container = document.getElementById("home-daily-grid");
  const html = generateBookHTML(books);
  container.insertAdjacentHTML("beforeend", html);
}

function loadMoreHomeDaily() {
  const btn = document.getElementById("btn-home-load-more");
  const oldText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';

  loadHomeDailyData(dailyHomeCurrentTab).then(() => {
    if (!btn.disabled) btn.innerHTML = oldText;
  });
}

/* ==============================================
   PHẦN 4: CÁC HÀM HỖ TRỢ & GIỎ HÀNG (QUAN TRỌNG)
   ============================================== */

// 👇 ĐÂY LÀ HÀM ADD TO CART ĐÃ SỬA (GỌI API THẬT)
async function addToCart(bookId) {
  // 1. Kiểm tra đăng nhập
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: "Đăng nhập",
      text: "Bạn cần đăng nhập để mua hàng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đến trang Đăng nhập",
      confirmButtonColor: "#C92127",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "pages/login.html";
      }
    });
    return;
  }

  // 2. Gọi API backend
  try {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId: bookId, quantity: 1 }),
    });

    const data = await res.json();

    // 3. Xử lý kết quả
    if (data.success) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      Toast.fire({ icon: "success", title: "Đã thêm vào giỏ hàng!" });

      // ⭐⭐⭐ CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG LẬP TỨC ⭐⭐⭐
      updateCartCount();
    } else {
      Swal.fire("Lỗi", data.message || "Không thể thêm vào giỏ", "error");
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi", "Không thể kết nối Server", "error");
  }
}

// Hàm render HTML cho sách
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
            
            <a href="pages/detail.html?id=${book.id}" class="fs-img-container">
                <img src="${book.image_url}" alt="${book.title}" 
                     style="height:180px; width:100%; object-fit:contain; margin-bottom:10px;"
                     onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="fs-card-info">
                <a href="pages/detail.html?id=${book.id}" title="${
        book.title
      }" style="text-decoration:none">
                    <h3 style="font-size:13px; margin:0 0 5px; height:40px; overflow:hidden; line-height:1.4; color:#333;">${
                      book.title
                    }</h3>
                </a>
                
                <div class="rating-area" style="font-size:10px; color:#F7941E; margin-bottom:5px;">
                    ${renderStars(book.average_rating || 5)}
                    <span style="color:#999;">(${book.review_count || 0})</span>
                </div>

                <div class="fs-price-row">
                    <div class="fs-price" style="color:#C92127; font-size:16px; font-weight:bold;">${formatMoney(
                      book.price
                    )}</div>
                    <div class="fs-old-price" style="text-decoration:line-through; color:#999; font-size:12px;">${formatMoney(
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
        </div>`;
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

/* ==============================================
   PHẦN 5: CÁC HÀM HỖ TRỢ KHÁC (DANH MỤC, SEARCH...)
   ============================================== */

async function loadCategories() {
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
  // loadBooks({ category: id }); // Cần gọi loadBooks lại
  handleSearch(); // Tận dụng hàm search để load
}

function handleHeaderCategoryClick(event, catId) {
  event.preventDefault();
  currentCategoryId = catId;
  handleSearch();
}

// Gợi ý tìm kiếm
let searchTimeout = null;
function handleInputSearch(keyword) {
  const suggestionBox = document.getElementById("search-suggestions-box");
  if (!keyword.trim()) {
    if (suggestionBox) suggestionBox.style.display = "none";
    return;
  }
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchSearchSuggestions(keyword);
  }, 300);
}

async function fetchSearchSuggestions(keyword) {
  const suggestionBox = document.getElementById("search-suggestions-box");
  try {
    const res = await fetch(`${API_BASE}/books?search=${keyword}&limit=5`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      renderSuggestions(data.data);
      if (suggestionBox) suggestionBox.style.display = "block";
    } else {
      if (suggestionBox) suggestionBox.style.display = "none";
    }
  } catch (error) {
    console.error("Lỗi gợi ý:", error);
  }
}

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
        </a>`
    )
    .join("");
  if (suggestionBox) suggestionBox.innerHTML = html;
}

document.addEventListener("click", function (e) {
  const searchBar = document.querySelector(".search-box");
  const suggestionBox = document.getElementById("search-suggestions-box");
  if (searchBar && !searchBar.contains(e.target)) {
    if (suggestionBox) suggestionBox.style.display = "none";
  }
});
async function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const token = localStorage.getItem("token");
  if (!token) {
    badge.innerText = "0";
    badge.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!data.success) {
      badge.innerText = "0";
      badge.style.display = "none";
      return;
    }

    // ✅ Dùng summary.total_items từ backend
    const count = data.summary?.total_items || 0;
    badge.innerText = count;
    badge.style.display = count > 0 ? "block" : "none";
  } catch (err) {
    console.error("Lỗi cập nhật số lượng giỏ hàng:", err);
    badge.innerText = "0";
    badge.style.display = "none";
  }
}
// index.js hoặc api.js
function logout() {
  // Xóa token và user khỏi localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Cập nhật header
  updateHeaderUser();
  updateCartCount();

  // Chuyển về trang đăng nhập hoặc trang chủ
  window.location.href = "pages/login.html";
}
