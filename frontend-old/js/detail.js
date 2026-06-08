// fe/js/detail.js

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id");
let currentRating = 0; // Lưu số sao người dùng chọn

// Đảm bảo API_BASE có giá trị
const BASE_URL =
  typeof API_BASE !== "undefined" ? API_BASE : "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  if (!bookId) {
    Swal.fire({
      title: "Lỗi",
      text: "Không tìm thấy sản phẩm!",
      icon: "error",
    }).then(() => {
      window.location.href = "../index.html";
    });
    return;
  }

  loadBookDetail();
  loadReviews();
});

// 1. Tải chi tiết sách
async function loadBookDetail() {
  const container = document.getElementById("detail-content");
  const reviewSection = document.getElementById("review-section");

  try {
    const res = await fetch(`${BASE_URL}/books/${bookId}`);
    const data = await res.json();

    if (data.success) {
      const book = data.data;
      const formatMoney = (val) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(val);
      const originalPrice = book.original_price || book.price * 1.2;
      const discount = Math.round(
        ((originalPrice - book.price) / originalPrice) * 100
      );

      // Render HTML chuyên nghiệp 2 cột
      container.innerHTML = `
                <div class="product-detail-layout">
                    <div class="detail-left">
                        <img src="${book.image_url}" alt="${
        book.title
      }" onerror="this.src='https://via.placeholder.com/400x400?text=Đang+cập+nhật+ảnh'">
                    </div>
                    <div class="detail-right">
                        <h1 class="detail-title">${book.title}</h1>
                        <div class="detail-meta">
                            Nhà cung cấp: <span>Fahasa</span> | 
                            Tác giả: <span>${book.author}</span>
                        </div>
                        
                        <div class="detail-price-box">
                            <span class="d-price-current">${formatMoney(
                              book.price
                            )}</span>
                            <span class="d-price-old">${formatMoney(
                              originalPrice
                            )}</span>
                            <span class="d-discount-badge">-${discount}%</span>
                        </div>

                        <div style="margin-bottom: 25px; line-height: 1.6; color: #555; font-size: 15px;">
                            <strong>Mô tả sản phẩm:</strong><br>
                            <div style="margin-top: 10px;">${
                              book.description ||
                              "Đang cập nhật nội dung cho sản phẩm này..."
                            }</div>
                        </div>

                        <button class="btn-buy-now" onclick="addToCart(${
                          book.id
                        })">
                            <i class="fas fa-cart-plus"></i> THÊM VÀO GIỎ HÀNG
                        </button>
                    </div>
                </div>
            `;

      // Hiện phần đánh giá sau khi tải xong sách
      reviewSection.style.display = "block";
    } else {
      container.innerHTML =
        '<div style="text-align:center; padding:50px; color:red;"><h3>Không tìm thấy sách!</h3></div>';
    }
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div style="text-align:center; padding:50px; color:red;"><h3>Lỗi kết nối Server!</h3><p>Vui lòng kiểm tra lại Backend.</p></div>';
  }
}

// 2. Xử lý chọn sao
function selectStar(n) {
  currentRating = n;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`s${i}`);
    if (i <= n) star.classList.add("active");
    else star.classList.remove("active");
  }
  const labels = ["", "Rất tệ", "Tệ", "Bình thường", "Hài lòng", "Tuyệt vời"];
  document.getElementById("rating-text").innerText = `(${labels[n]})`;
}

// 3. Gửi đánh giá
async function submitReview() {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire("Thông báo", "Vui lòng đăng nhập để đánh giá.", "warning");
    return;
  }
  if (currentRating === 0) {
    Swal.fire("Chưa chấm điểm", "Vui lòng chọn số sao!", "warning");
    return;
  }
  const comment = document.getElementById("comment-input").value.trim();
  if (comment.length < 10) {
    Swal.fire(
      "Nội dung quá ngắn",
      "Vui lòng nhập đánh giá ít nhất 10 ký tự.",
      "warning"
    );
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/books/${bookId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: currentRating, comment }),
    });

    if (res.ok) {
      Swal.fire("Thành công", "Cảm ơn đánh giá của bạn!", "success");
      loadReviews(); // Tải lại danh sách
      document.getElementById("comment-input").value = "";
      selectStar(0);
    } else {
      const data = await res.json();
      Swal.fire("Lỗi", data.message || "Có lỗi xảy ra", "error");
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi", "Lỗi kết nối Server", "error");
  }
}

// 4. Tải danh sách đánh giá
async function loadReviews() {
  const container = document.getElementById("reviews-list");
  try {
    const res = await fetch(`${BASE_URL}/books/${bookId}/reviews`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = data.data
        .map(
          (r) => `
                <div class="user-review-item">
                    <div class="avatar-circle">${
                      r.user_name ? r.user_name.charAt(0).toUpperCase() : "K"
                    }</div>
                    <div class="review-content">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                            <span class="review-author">${
                              r.user_name || "Khách hàng"
                            }</span>
                            <span class="review-time">${new Date(
                              r.created_at
                            ).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div class="star-display">${renderStars(r.rating)}</div>
                        <div class="comment-text">${r.comment}</div>
                    </div>
                </div>
            `
        )
        .join("");
    } else {
      container.innerHTML =
        '<div style="text-align:center; padding:30px; color:#999; background:#fafafa; border-radius:8px;">Chưa có đánh giá nào cho sản phẩm này.</div>';
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div style="color:red;">Lỗi tải đánh giá.</div>';
  }
}

// Helper: Vẽ sao
function renderStars(n) {
  let html = "";
  for (let i = 1; i <= 5; i++)
    html +=
      i <= n ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
  return html;
}

// Hàm thêm giỏ hàng (Cần đảm bảo backend có API này)
async function addToCart(bookId) {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: "Đăng nhập",
      text: "Bạn cần đăng nhập để mua hàng.",
      icon: "warning",
      confirmButtonText: "Đồng ý",
      confirmButtonColor: "#C92127",
    });
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId, quantity: 1 }),
    });
    if (res.ok) {
      Swal.fire({
        title: "Thành công",
        text: "Đã thêm vào giỏ hàng!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      // Nếu có hàm cập nhật icon giỏ hàng thì gọi ở đây
      // if(typeof updateCartCount === 'function') updateCartCount();
    } else {
      Swal.fire("Lỗi", "Không thể thêm vào giỏ hàng", "error");
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi", "Lỗi kết nối", "error");
  }
}
