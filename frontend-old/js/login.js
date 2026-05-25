

// Bắt sự kiện submit form ngay khi trang load xong
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

async function handleLogin(event) {
  event.preventDefault(); // Chặn load lại trang

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-message");
  const btnSubmit = document.querySelector(".btn-submit");

  // Reset lỗi
  errorMsg.style.display = "none";
  errorMsg.innerText = "";

  // Khóa nút bấm
  btnSubmit.innerText = "Đang xử lý...";
  btnSubmit.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // 👇 ĐIỂM SỬA QUAN TRỌNG NHẤT:
    // Tìm token ở cả 2 chỗ: data.token (nếu backend để ngoài) HOẶC data.data.token (nếu backend lồng vào trong)
    const token = data.token || (data.data && data.data.token);
    const user = data.user || (data.data && data.data.user);

    // Kiểm tra: Nếu Server báo OK VÀ tìm thấy Token
    if (res.ok && token) {
      // 1. Lưu dữ liệu
      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Đăng nhập thành công! Token:", token);

      // 2. Chuyển trang
      // Vì bạn đang chạy file trực tiếp (file:///E:/...), dùng đường dẫn tương đối là an toàn nhất
      window.location.href = "../index.html";
    } else {
      // Nếu không có token hoặc server báo lỗi
      throw new Error(
        data.message || "Đăng nhập thất bại (Không tìm thấy Token)"
      );
    }
  } catch (err) {
    console.error(err);
    errorMsg.innerText = err.message; // Hiện đúng thông báo lỗi
    errorMsg.style.display = "block";

    // Mở lại nút bấm
    btnSubmit.innerText = "Đăng Nhập Ngay";
    btnSubmit.disabled = false;
  }
}
