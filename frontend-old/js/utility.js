// fe/js/utility.js

// 1. FLASH SALE: Cuộn xuống
function scrollToFlashSale() {
  const section = document.getElementById("flash-sale-area");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    console.error("Chưa tìm thấy ID flash-sale-area trong HTML");
  }
}

// 2. MÃ GIẢM GIÁ: Bật/Tắt Popup
function toggleVoucherPopup() {
  const modal = document.getElementById("voucher-modal");
  if (modal) {
    // Nếu đang hiện thì ẩn, đang ẩn thì hiện
    if (modal.style.display === "flex") {
      modal.style.display = "none";
    } else {
      modal.style.display = "flex";
    }
  }
}

// 3. SÁCH MỚI: Lọc sách mới nhất
function filterNewBooks() {
  // Gọi hàm loadBooks từ index.js
  if (typeof loadBooks === "function") {
    // Reset bộ lọc cũ
    const priceSelect = document.getElementById("price-filter");
    if (priceSelect) priceSelect.value = "";

    // Cuộn xuống danh sách
    document
      .getElementById("main-content")
      .scrollIntoView({ behavior: "smooth" });

    // Gọi API (Giả sử backend sắp xếp mặc định là mới nhất)
    loadBooks();

    // Thông báo nhỏ
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Đã lọc sách mới nhất",
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

// 4. GIFT CARD: Thông báo
function showGiftCardInfo() {
  Swal.fire({
    imageUrl: "https://cdn-icons-png.flaticon.com/512/4213/4213657.png",
    imageHeight: 100,
    title: "Gift Card",
    text: "Chức năng tặng thẻ quà tặng đang được xây dựng!",
    confirmButtonColor: "#C92127",
  });
}

// Copy mã giảm giá
function copyCode(code) {
  navigator.clipboard.writeText(code);
  // Ẩn popup sau khi copy
  document.getElementById("voucher-modal").style.display = "none";
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: `Đã sao chép: ${code}`,
    showConfirmButton: false,
    timer: 1500,
  });
}
