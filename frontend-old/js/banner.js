document.addEventListener("DOMContentLoaded", function () {
  const bannerSwiper = new Swiper(".mySwiper", {
    // Cài đặt cơ bản
    slidesPerView: 1, // Chỉ hiện 1 ảnh mỗi lần
    spaceBetween: 30, // Khoảng cách giữa các ảnh (nếu có)
    loop: true, // Lặp lại vô tận (quan trọng để chạy liên tục)

    // Pagination (dấu chấm tròn dưới banner)
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    // Navigation (mũi tên chuyển slide)
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    // Tự động chạy (autoplay)
    autoplay: {
      delay: 3500, // Chuyển slide sau 3.5 giây
      disableOnInteraction: false, // Vẫn chạy tự động khi người dùng tương tác
    },
  });
});
document.addEventListener("DOMContentLoaded", function () {
  // 1. SWIPER BANNER CHÍNH (Nếu bạn đã thêm Swiper.js)
  const bannerSwiper = new Swiper(".mySwiper", {
    // ... Cấu hình cũ (autoplay, loop, v.v.) ...
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    pagination: { el: ".swiper-pagination" },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  // 2. SWIPER FLASH SALE MỚI (Cần thêm)
  const flashSaleSwiper = new Swiper(".flashSaleSwiper", {
    slidesPerView: 5, // Số lượng sản phẩm hiển thị cùng lúc
    spaceBetween: 10,
    navigation: {
      nextEl: ".flash-sale-next",
      prevEl: ".flash-sale-prev",
    },
    // Thêm responsive breakpoints nếu cần
    breakpoints: {
      // Hiển thị 3 sản phẩm trên màn hình nhỏ hơn 768px
      768: {
        slidesPerView: 3,
      },
      // Hiển thị 5 sản phẩm trên màn hình lớn hơn
      1024: {
        slidesPerView: 5,
      },
    },
  });

  // 3. LOGIC ĐẾM NGƯỢC THỜI GIAN (TIMER)
  function startTimer() {
    // Đặt mốc thời gian kết thúc sale (Ví dụ: 1:00 AM ngày mai)
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1); // Thêm 1 ngày
    endTime.setHours(1, 0, 0, 0); // Đặt giờ kết thúc là 01:00:00 AM

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById("flash-sale-timer").innerHTML = "ĐÃ KẾT THÚC";
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Cập nhật DOM
      document.getElementById("hours").innerText = hours
        .toString()
        .padStart(2, "0");
      document.getElementById("minutes").innerText = minutes
        .toString()
        .padStart(2, "0");
      document.getElementById("seconds").innerText = seconds
        .toString()
        .padStart(2, "0");
    }, 1000); // Cập nhật mỗi giây
  }

  startTimer();
});
