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
// --- LOGIC MENU DANH MỤC HEADER ---

document.addEventListener("DOMContentLoaded", () => {
  // ... các hàm khác ...
  loadHeaderCategories(); // Gọi hàm này khi trang tải xong
});

async function loadHeaderCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();

    const menuContainer = document.getElementById("header-category-list");

    if (data.success) {
      // Danh sách icon giả lập cho đẹp (vì DB bạn có thể chưa có field icon)
      const icons = [
        "fa-book",
        "fa-chart-line",
        "fa-brain",
        "fa-child",
        "fa-language",
        "fa-globe",
      ];

      menuContainer.innerHTML = data.data
        .map((cat, index) => {
          // Lấy icon tương ứng hoặc random
          const iconClass = icons[index % icons.length];

          return `
                <a href="javascript:void(0)" 
                   class="cate-menu-item" 
                   onclick="handleHeaderCategoryClick(event, ${cat.id})">
                    <i class="fas ${iconClass}"></i>
                    <span>${cat.name}</span>
                </a>
                `;
        })
        .join("");
    }
  } catch (err) {
    console.error("Lỗi tải menu header:", err);
  }
}

// Hàm xử lý khi bấm vào danh mục trên Header
function handleHeaderCategoryClick(event, catId) {
  event.preventDefault();

  // 1. Nếu đang ở trang chủ (index.html) -> Lọc trực tiếp
  if (typeof loadBooks === "function") {
    // Tái sử dụng hàm selectCategory đã viết ở bài trước
    // Hoặc gọi trực tiếp loadBooks
    currentCategoryId = catId; // Cập nhật biến toàn cục
    applyFilters(); // Gọi hàm lọc

    // Cuộn xuống phần danh sách sách cho người dùng thấy
    document
      .getElementById("main-content")
      .scrollIntoView({ behavior: "smooth" });
  }
  // 2. Nếu đang ở trang con (detail, cart...) -> Chuyển về trang chủ kèm tham số
  else {
    window.location.href = `../index.html?category=${catId}`;
  }
}
// --- LOGIC GỢI Ý HÔM NAY (HOMEPAGE) ---

// 1. Mock Data (Dữ liệu giả chất lượng cao)
const homeDailyBooks = [
  {
    id: 101,
    title: "Tâm Lý Học Về Tiền",
    price: 159000,
    old_price: 199000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/2e/98/64/093b589574488b394017a4773d42c75a.jpg",
    sold: 120,
  },
  {
    id: 102,
    title: "Đừng Lựa Chọn An Nhàn Khi Còn Trẻ",
    price: 68000,
    old_price: 89000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/38/c7/27/a326075908b178c75047466870631671.jpg",
    sold: 850,
  },
  {
    id: 103,
    title: "Thiên Tài Bên Trái, Kẻ Điên Bên Phải",
    price: 105000,
    old_price: 149000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/45/3b/2b/28876104d444747c3461239f6974868e.jpg",
    sold: 340,
  },
  {
    id: 104,
    title: "Muôn Kiếp Nhân Sinh - Phần 2",
    price: 180000,
    old_price: 240000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/88/52/63/144704020300d8926065586616474662.jpg",
    sold: 1200,
  },
  {
    id: 105,
    title: "Cây Cam Ngọt Của Tôi",
    price: 63000,
    old_price: 108000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
    sold: 900,
  },
  {
    id: 106,
    title: "Sapiens - Lược Sử Loài Người",
    price: 215000,
    old_price: 280000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/ad/0c/36/4545582c035654929871626353995663.jpg",
    sold: 560,
  },
  {
    id: 107,
    title: "Dám Bị Ghét",
    price: 76000,
    old_price: 96000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/9d/1f/28/7f6d4d2325785055b46726884025c833.jpg",
    sold: 320,
  },
  {
    id: 108,
    title: "Hiểu Về Trái Tim",
    price: 120000,
    old_price: 150000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/24/e9/8f/b495914652277d33878b47209825b443.jpg",
    sold: 410,
  },
  {
    id: 109,
    title: "Luật Tâm Thức",
    price: 220000,
    old_price: 300000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/6e/8f/3e/32616492323c6046755452d378033068.jpg",
    sold: 78,
  },
  {
    id: 110,
    title: "Hành Trình Về Phương Đông",
    price: 88000,
    old_price: 110000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/c6/3e/26/d561257008107662c0199047970d4c82.jpg",
    sold: 650,
  },
];

// Nhân bản dữ liệu để demo load more (thành 30 cuốn)
let homeBookList = [...homeDailyBooks, ...homeDailyBooks, ...homeDailyBooks];
let homeCurrentIndex = 0;
const homePageSize = 10;

// Tự động chạy khi load trang
document.addEventListener("DOMContentLoaded", () => {
  // ... các hàm khác của bạn ...
  renderHomeDaily();
});

// 2. Hàm vẽ sách ra trang chủ
function renderHomeDaily() {
  const container = document.getElementById("home-daily-grid");
  const loadBtn = document.getElementById("btn-home-load-more");

  // Nếu là lần đầu load thì xóa loading
  if (homeCurrentIndex === 0) container.innerHTML = "";

  // Cắt lấy 10 cuốn tiếp theo
  const nextBooks = homeBookList.slice(
    homeCurrentIndex,
    homeCurrentIndex + homePageSize
  );

  if (nextBooks.length === 0) {
    loadBtn.innerHTML = "Đã xem hết sản phẩm";
    loadBtn.disabled = true;
    loadBtn.style.opacity = "0.6";
    return;
  }

  const html = nextBooks
    .map((book) => {
      const formatMoney = (amount) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount);
      const discount = Math.round(
        ((book.old_price - book.price) / book.old_price) * 100
      );

      return `
        <div class="product-card">
            <div class="badge-hot">-${discount}%</div>
            
            <a href="pages/detail.html?id=${book.id}">
                <img src="${book.img}" alt="${book.title}" 
                     style="height:180px; width:100%; object-fit:contain; margin-bottom:10px;"
                     onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <a href="pages/detail.html?id=${book.id}" title="${book.title}">
                <h3 style="font-size:13px; margin:0 0 5px; height:36px; overflow:hidden; line-height:1.4; color:#333;">${
                  book.title
                }</h3>
            </a>
            
            <div class="rating-area" style="font-size:10px; color:#F7941E; margin-bottom:5px;">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                <span style="color:#999;">| Đã bán ${book.sold}</span>
            </div>

            <div style="display:flex; gap:8px; align-items:center;">
                <div class="price" style="color:#C92127; font-size:16px; font-weight:bold;">${formatMoney(
                  book.price
                )}</div>
                <div class="original-price" style="text-decoration:line-through; color:#ccc; font-size:12px;">${formatMoney(
                  book.old_price
                )}</div>
            </div>

            <button class="btn-add-cart" onclick="addToCart(${
              book.id
            })" style="margin-top:10px; width:100%;">
                <i class="fas fa-cart-plus"></i> Thêm vào giỏ
            </button>
        </div>
        `;
    })
    .join("");

  container.insertAdjacentHTML("beforeend", html);
  homeCurrentIndex += homePageSize;
}

// 3. Hàm xử lý nút Xem thêm
function loadMoreHomeDaily() {
  const btn = document.getElementById("btn-home-load-more");
  const oldText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';

  setTimeout(() => {
    renderHomeDaily();
    btn.innerHTML = oldText;
  }, 500);
}

// 4. Hàm chuyển Tab (Mô phỏng)
function switchHomeTab(type, btn) {
  // Đổi class active
  document
    .querySelectorAll(".d-tab")
    .forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");

  // Reset lại danh sách và load lại (xáo trộn giả lập)
  homeCurrentIndex = 0;
  // Xáo trộn mảng để giả vờ là dữ liệu mới
  homeBookList = homeBookList.sort(() => Math.random() - 0.5);

  const loadBtn = document.getElementById("btn-home-load-more");
  loadBtn.disabled = false;
  loadBtn.innerHTML =
    'Xem thêm 20 sản phẩm <i class="fas fa-chevron-down"></i>';
  loadBtn.style.opacity = "1";

  renderHomeDaily();
}
