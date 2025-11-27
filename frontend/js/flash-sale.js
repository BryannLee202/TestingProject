// DỮ LIỆU GIẢ (MOCK DATA) - ĐỂ CHẠY NGAY KHÔNG CẦN BACKEND
const mockBooks = [
  {
    id: 1,
    title: "Cây Cam Ngọt Của Tôi",
    price: 63000,
    original_price: 108000,
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
    cate: "van-hoc",
  },
  {
    id: 2,
    title: "Nhà Giả Kim",
    price: 50000,
    original_price: 79000,
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/45/3b/2b/28876104d444747c3461239f6974868e.jpg",
    cate: "van-hoc",
  },
  {
    id: 3,
    title: "Đắc Nhân Tâm",
    price: 55000,
    original_price: 86000,
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/2e/98/64/093b589574488b394017a4773d42c75a.jpg",
    cate: "kinh-te",
  },
  {
    id: 4,
    title: "Tâm Lý Học Tội Phạm",
    price: 99000,
    original_price: 150000,
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/38/c7/27/a326075908b178c75047466870631671.jpg",
    cate: "kinh-te",
  },
  {
    id: 5,
    title: "Dế Mèn Phiêu Lưu Ký",
    price: 35000,
    original_price: 50000,
    image: "https://upload.wikimedia.org/wikipedia/vi/6/66/DeMenPhieuLuuKy.JPG",
    cate: "thieu-nhi",
  },
  {
    id: 6,
    title: "Harry Potter Tập 1",
    price: 120000,
    original_price: 200000,
    image:
      "https://upload.wikimedia.org/wikipedia/vi/a/a4/Harry_Potter_v%C3%A0_H%C3%B2n_%C4%91%C3%A1_Ph%C3%B9_th%E1%BB%A7y_%28b%C3%ACa_2008%29.jpg",
    cate: "van-hoc",
  },
  {
    id: 7,
    title: "Doraemon Tập 1",
    price: 18000,
    original_price: 25000,
    image:
      "https://upload.wikimedia.org/wikipedia/vi/c/c9/Doraemon_volume_1_cover.jpg",
    cate: "thieu-nhi",
  },
  {
    id: 8,
    title: "Conan Tập 100",
    price: 22000,
    original_price: 25000,
    image:
      "https://upload.wikimedia.org/wikipedia/vi/1/1d/Conan_Vol_100_O.B.jpg",
    cate: "thieu-nhi",
  },
  {
    id: 9,
    title: "Cha Giàu Cha Nghèo",
    price: 80000,
    original_price: 110000,
    image:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.instagram.com/125432651_180237937096281_2773229712959883503_n.jpg",
    cate: "kinh-te",
  },
  {
    id: 10,
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    price: 65000,
    original_price: 90000,
    image:
      "https://salt.tikicdn.com/cache/w1200/ts/product/38/c7/27/a326075908b178c75047466870631671.jpg",
    cate: "kinh-te",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  renderTimeline();
  startTimer();

  // Mặc định load tất cả sách từ Mock Data (Để tránh lỗi API)
  renderBooks(mockBooks);
});

// 1. RENDER LỊCH (Thứ 2 -> CN)
function renderCalendar() {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const topics = [
    "Văn học",
    "Kinh tế",
    "Thiếu nhi",
    "Tâm lý",
    "Kỹ năng",
    "Ngoại ngữ",
    "Tổng hợp",
  ];
  const container = document.getElementById("calendar-tabs");

  let html = "";
  days.forEach((day, index) => {
    const activeClass = index === 0 ? "active" : ""; // Mặc định chọn Thứ 2
    html += `
            <div class="cal-tab ${activeClass}" onclick="setActiveTab(this)">
                <div class="cal-header">${day}</div>
                <div class="cal-body">${topics[index]}</div>
            </div>
        `;
  });
  container.innerHTML = html;
}

function setActiveTab(el) {
  document
    .querySelectorAll(".cal-tab")
    .forEach((e) => e.classList.remove("active"));
  el.classList.add("active");
}

// 2. RENDER MỐC GIỜ
function renderTimeline() {
  const times = ["08:00", "12:00", "16:00", "20:00", "22:00"];
  const container = document.getElementById("timeline-slots");

  let html = "";
  times.forEach((time, index) => {
    const status = index === 0 ? "Đang bán" : "Sắp diễn ra";
    const activeClass = index === 0 ? "active" : "";
    html += `
            <div class="time-slot ${activeClass}" onclick="setActiveTime(this)">
                <div class="slot-time">${time}</div>
                <div class="slot-status">${status}</div>
            </div>
        `;
  });
  container.innerHTML = html;
}

function setActiveTime(el) {
  document
    .querySelectorAll(".time-slot")
    .forEach((e) => e.classList.remove("active"));
  el.classList.add("active");
  // Giả lập load lại sách khi đổi giờ (Random shuffle)
  renderBooks(mockBooks.sort(() => Math.random() - 0.5));
}

// 3. LỌC THEO THỂ LOẠI
function filterByCate(cate, btn) {
  // Active button
  document
    .querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  // Lọc dữ liệu
  if (cate === "all") {
    renderBooks(mockBooks);
  } else {
    const filtered = mockBooks.filter((b) => b.cate === cate);
    renderBooks(filtered);
  }
}

// 4. VẼ SÁCH RA MÀN HÌNH
function renderBooks(books) {
  const container = document.getElementById("flash-sale-grid");
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (books.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px;">Không có sách nào!</div>`;
    return;
  }

  container.innerHTML = books
    .map((book) => {
      const discount = Math.round(
        ((book.original_price - book.price) / book.original_price) * 100
      );
      const soldQty = Math.floor(Math.random() * 80) + 5;

      return `
        <div class="fs-product-card">
            <div class="badge-percent">-${discount}%</div>
            
            <a href="../pages/detail.html?id=${book.id}" class="fs-img-wrap">
                <img src="${
                  book.image
                }" onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="fs-title">${book.title}</div>
            
            <div class="fs-price-row">
                <div class="fs-price">${formatMoney(book.price)}</div>
                <div class="fs-old-price">${formatMoney(
                  book.original_price
                )}</div>
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

// 5. ĐẾM NGƯỢC
function startTimer() {
  let time = 7200 + 5400; // Giả lập thời gian
  setInterval(() => {
    time--;
    if (time < 0) time = 10000;

    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;

    document.getElementById("h").innerText = h.toString().padStart(2, "0");
    document.getElementById("m").innerText = m.toString().padStart(2, "0");
    document.getElementById("s").innerText = s.toString().padStart(2, "0");
  }, 1000);
}
