// ⚠️ QUAN TRỌNG: Không khai báo lại API_BASE nếu đã có trong api.js
// Nếu file api.js chưa có thì mới mở dòng dưới ra:
// const API_BASE = "http://localhost:5000/api";

async function handleRegister(event) {
  event.preventDefault(); // Chặn load lại trang

  // Lấy dữ liệu từ form
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Lấy thẻ hiển thị lỗi & nút bấm
  const errorMsg = document.getElementById("error-message");
  const btnSubmit = document.querySelector(".btn-submit");

  // Reset lỗi
  errorMsg.style.display = "none";
  errorMsg.innerText = "";

  // 1. Kiểm tra mật khẩu xác nhận
  if (password !== confirmPassword) {
    errorMsg.innerText = "❌ Mật khẩu xác nhận không khớp!";
    errorMsg.style.display = "block";
    return;
  }

  // Khóa nút để tránh bấm nhiều lần
  btnSubmit.innerText = "Đang xử lý...";
  btnSubmit.disabled = true;

  try {
    console.log("🚀 Đang gửi dữ liệu đăng ký...");

    // 2. Gửi yêu cầu lên Server
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username, // Backend cần 'name'
        email: email,
        password: password,
      }),
    });

    const data = await res.json();
    console.log("📦 Phản hồi từ Server:", data);

    // 3. Xử lý kết quả
    if (res.ok) {
      // ✅ THÀNH CÔNG
      alert("🎉 Đăng ký thành công! Bạn có thể đăng nhập ngay.");

      // Chuyển sang trang đăng nhập
      // Vì register.html và login.html cùng nằm trong thư mục 'pages' nên gọi trực tiếp
      window.location.href = "login.html";
    } else {
      // ❌ THẤT BẠI (Backend báo lỗi, ví dụ: Email trùng)
      throw new Error(data.message || "Đăng ký thất bại");
    }
  } catch (err) {
    console.error("Lỗi:", err);
    // Hiện lỗi ra màn hình cho người dùng thấy
    errorMsg.innerText = "⚠️ " + (err.message || "Lỗi kết nối Server!");
    errorMsg.style.display = "block";

    // Mở lại nút bấm
    btnSubmit.innerText = "ĐĂNG KÝ";
    btnSubmit.disabled = false;
  }
}
