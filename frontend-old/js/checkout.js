// fe/js/checkout.js

async function handleCheckout(event) {
  if (event) event.preventDefault();

  const name = document.getElementById("order-name").value;
  const phone = document.getElementById("order-phone").value;
  const address = document.getElementById("order-address").value;

  // Kiểm tra dữ liệu
  if (!name || !phone || !address) {
    Swal.fire(
      "Thiếu thông tin",
      "Vui lòng điền đầy đủ thông tin giao hàng",
      "warning"
    );
    return;
  }

  // Lấy token và tổng tiền
  const token = localStorage.getItem("token");
  // Lấy tổng tiền tạm tính từ localStorage (đã lưu lúc ở trang Cart)
  const savedTotal = localStorage.getItem("cartTotal") || 0;

  // Lấy danh sách sách (Nếu biến global cartItems chưa có, phải gọi API lấy lại)
  // Giả sử cartItems đã được load từ hàm loadCheckoutData trước đó
  if (!cartItems || cartItems.length === 0) {
    Swal.fire("Lỗi", "Giỏ hàng trống!", "error");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: name,
        phone: phone,
        address: address,
        paymentMethod: "COD", // Mặc định
        shippingFee: 30000, // Mặc định phí ship
        total: savedTotal,
        items: cartItems, // Danh sách sách
      }),
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire({
        title: "Thành công!",
        text: "Đặt hàng thành công. Mã đơn: " + data.orderId,
        icon: "success",
      }).then(() => {
        window.location.href = "../index.html"; // Về trang chủ
      });
    } else {
      Swal.fire("Lỗi đặt hàng", data.message, "error");
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi mạng", "Không thể kết nối Server", "error");
  }
}
