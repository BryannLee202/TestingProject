// fe/js/daily.js

// MOCK DATA CHUẨN (Giống ảnh bạn gửi)
const books = [
  {
    title: "Lãnh Đạo Và Văn Hóa Doanh Nghiệp",
    price: 144000,
    old_price: 180000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/2e/98/64/093b589574488b394017a4773d42c75a.jpg",
    sold: 47,
  },
  {
    title: "Cambridge English Qualifications - B1 Preliminary",
    price: 295000,
    old_price: 328000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/45/3b/2b/28876104d444747c3461239f6974868e.jpg",
    sold: 30,
  },
  {
    title: "Chưa Kịp Lớn Đã Phải Trưởng Thành - Quyển 2",
    price: 63000,
    old_price: 79000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/38/c7/27/a326075908b178c75047466870631671.jpg",
    sold: 54,
  },
  {
    title: "Bộ Những Tia Nắng Đầu Tiên (Bộ 10 Cuốn)",
    price: 81000,
    old_price: 90000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
    sold: 57,
  },
  {
    title: "Gậy Phát Sáng A80 Lightstick Cờ Việt Nam",
    price: 304000,
    old_price: 380000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/ad/0c/36/4545582c035654929871626353995663.jpg",
    sold: 6,
  },
  {
    title: "Tam Quốc Diễn Nghĩa (Trọn Bộ 3 Tập)",
    price: 312000,
    old_price: 390000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/88/52/63/144704020300d8926065586616474662.jpg",
    sold: 57,
  },
  {
    title: "Scarlett - Hậu Cuốn Theo Chiều Gió",
    price: 172000,
    old_price: 215000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/9d/1f/28/7f6d4d2325785055b46726884025c833.jpg",
    sold: 21,
  },
  {
    title: "Tôi Đã Kiếm 1 Triệu Đô Đầu Tiên Trên Internet",
    price: 169000,
    old_price: 199000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/24/e9/8f/b495914652277d33878b47209825b443.jpg",
    sold: 12,
  },
  {
    title: "Truyện Trạng Quỳnh - Trạng Lợn (Tái Bản)",
    price: 28000,
    old_price: 35000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/6e/8f/3e/32616492323c6046755452d378033068.jpg",
    sold: 72,
  },
  {
    title: "Charlie Munger - Phương Pháp Đầu Tư Giá Trị",
    price: 135000,
    old_price: 169000,
    img: "https://salt.tikicdn.com/cache/w1200/ts/product/c6/3e/26/d561257008107662c0199047970d4c82.jpg",
    sold: 41,
  },
];

// Nhân bản dữ liệu để demo nhiều sách
let displayBooks = [...books, ...books, ...books];
let currentIndex = 0;
const itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  renderBooks();
});

function renderBooks() {
  const container = document.getElementById("daily-grid");
  const loadBtn = document.getElementById("btn-load-more");

  // Xóa spinner loading nếu là lần đầu
  if (currentIndex === 0) container.innerHTML = "";

  // Lấy 10 sách tiếp theo
  const nextBatch = displayBooks.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  if (nextBatch.length === 0) {
    loadBtn.innerText = "Đã hiển thị hết sản phẩm";
    loadBtn.disabled = true;
    loadBtn.style.borderColor = "#ccc";
    loadBtn.style.color = "#999";
    return;
  }

  const html = nextBatch
    .map((book) => {
      const formatMoney = (val) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(val);
      const discount = Math.round(
        ((book.old_price - book.price) / book.old_price) * 100
      );

      return `
        <div class="suggest-card">
            <span class="badge-discount">-${discount}%</span>
            
            <a href="detail.html" class="card-img-wrap">
                <img src="${book.img}" alt="${
        book.title
      }" onerror="this.src='https://via.placeholder.com/200'">
            </a>
            
            <div class="card-title" title="${book.title}">${book.title}</div>
            
            <div class="price-row">
                <div class="current-price">${formatMoney(book.price)}</div>
                <div class="badge-discount" style="position:static; font-size:11px; background:#C92127;">-${discount}%</div>
            </div>
            
            <div class="original-price">${formatMoney(book.old_price)}</div>
            
            <div style="margin-top:8px; display:flex; align-items:center;">
                <span class="rating-stars">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                </span>
                <span class="sold-count">| Đã bán ${book.sold}</span>
            </div>
        </div>
        `;
    })
    .join("");

  container.insertAdjacentHTML("beforeend", html);
  currentIndex += itemsPerPage;
}

function loadMoreBooks() {
  // Giả lập loading
  const btn = document.getElementById("btn-load-more");
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';

  setTimeout(() => {
    renderBooks();
    btn.innerHTML = originalText;
  }, 500); // Delay 0.5s cho giống thật
}
