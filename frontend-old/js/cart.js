

// 1. Tự động chạy khi tải trang
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Đang tải trang giỏ hàng...");
  loadCart();
});

// 2. Tải dữ liệu giỏ hàng
async function loadCart() {
  const token = getToken();

  // Kiểm tra đăng nhập
  if (!token) {
    alert("Bạn chưa đăng nhập! Đang chuyển hướng...");
    window.location.href = "login.html";
    return;
  }

  try {
    console.log("📡 Đang gọi API lấy giỏ hàng...");
    const res = await fetch(`${API_BASE}/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    console.log("📦 Dữ liệu nhận được từ Server:", result);

    // Xử lý dữ liệu trả về (chấp nhận cả 2 cấu trúc)
    // Trường hợp 1: result là mảng trực tiếp [item1, item2]
    // Trường hợp 2: result là object { success: true, data: [...] }
    let items = [];
    if (Array.isArray(result)) {
      items = result;
    } else if (result.data && Array.isArray(result.data)) {
      items = result.data;
    } else if (result.cartItems) {
      items = result.cartItems;
    }

    renderCart(items);
  } catch (err) {
    console.error("❌ Lỗi tải giỏ hàng:", err);
    alert("Lỗi kết nối đến Server!");
  }
}

// 3. Hiển thị lên màn hình (Logic quan trọng nhất)
function renderCart(items) {
  const tbody = document.getElementById("cart-items-body");
  const cartContent = document.getElementById("cart-content"); // Container chứa bảng
  const emptyMsg = document.getElementById("empty-msg"); // Thông báo giỏ trống
  const totalEl = document.getElementById("cart-total-price");

  // Nếu không tìm thấy các thẻ HTML này thì dừng lại (để tránh lỗi)
  if (!tbody) return;

  // Kiểm tra giỏ hàng trống
  if (!items || items.length === 0) {
    if (cartContent) cartContent.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  }

  // Hiển thị bảng, ẩn thông báo trống
  if (cartContent) cartContent.style.display = "block";
  if (emptyMsg) emptyMsg.style.display = "none";

  let totalAmount = 0;

  // Tạo HTML cho từng dòng
  const html = items
    .map((item) => {
      // 👇 LOGIC THÔNG MINH: Tự động tìm tên biến đúng (Hoa/Thường đều ok)
      const id = item.book_id || item.bookId || item.id || item.BookId;
      const title =
        item.title || item.Title || item.book_title || "Sản phẩm không tên";
      const price = item.price || item.Price || 0;
      const quantity = item.quantity || item.Quantity || 1;
      const image =
        item.image_url ||
        item.ImageURL ||
        item.image ||
        "https://via.placeholder.com/60";
      const author = item.author || item.Author || "Đang cập nhật";

      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      return `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <img src="${image}" style="width:60px; height:80px; object-fit:cover; border-radius:4px;">
                        <div>
                            <strong style="font-size:1.1em;">${title}</strong><br>
                            <span style="color:#666; font-size:0.9em;">${author}</span>
                        </div>
                    </div>
                </td>
                <td style="vertical-align: middle;">${formatMoney(price)}</td>
                <td style="vertical-align: middle;">
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button class="qty-btn" onclick="updateQty(${id}, ${
        quantity - 1
      })">-</button>
                        <span style="font-weight:bold; min-width:30px; text-align:center;">${quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${id}, ${
        quantity + 1
      })">+</button>
                    </div>
                </td>
                <td style="vertical-align: middle; color:#d63031; font-weight:bold;">
                    ${formatMoney(itemTotal)}
                </td>
                <td style="vertical-align: middle;">
                    <button onclick="removeItem(${id})" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2em;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");

  tbody.innerHTML = html;
  if (totalEl) totalEl.innerText = `Tổng tiền: ${formatMoney(totalAmount)}`;
}

// 4. Cập nhật số lượng
async function updateQty(bookId, newQty) {
  if (newQty < 1) return; // Không giảm dưới 1 (hoặc có thể hỏi xóa)

  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/cart/update/${bookId}`, {
      // Hoặc API /cart/update tùy backend
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQty }),
    });

    // Tải lại giỏ hàng để cập nhật tiền
    loadCart();
  } catch (err) {
    console.error("Lỗi cập nhật:", err);
    alert("Không thể cập nhật số lượng");
  }
}

// 5. Xóa sản phẩm
async function removeItem(bookId) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/cart/remove/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadCart();
  } catch (err) {
    console.error("Lỗi xóa:", err);
    alert("Lỗi khi xóa sản phẩm");
  }
}

// 6. Thanh toán
function checkout() {
  // Chuyển sang trang đặt hàng (sẽ làm sau)
  alert("Chức năng đang phát triển!");
}
