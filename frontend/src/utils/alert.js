import Swal from 'sweetalert2';

// Hàm hiển thị thông báo dạng Toast ở giữa màn hình với tone màu đỏ chủ đạo
export const showNotification = (title, text, type = 'success') => {
  // Yêu cầu: màu viền đỏ, chữ đỏ, nền đỏ nhạt
  const bgColor = 'bg-red-50';
  const borderColor = 'border-red-500';
  const textColor = 'text-red-600';
  const titleColor = 'text-red-700';

  // Icon check hoặc error (màu đỏ)
  const iconHtml = type === 'success'
    ? `<svg class="w-7 h-7 ${textColor} mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : `<svg class="w-7 h-7 ${textColor} mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  return Swal.fire({
    position: 'center', // Hiện ở giữa màn hình
    showConfirmButton: false,
    timer: 2000,
    background: 'transparent', // Xóa nền mặc định
    backdrop: `rgba(0,0,0,0.4)`, // Thêm lớp phủ mờ phía sau để nổi bật thông báo ở giữa
    padding: 0,
    customClass: {
      popup: '!bg-transparent !shadow-none !p-0', 
    },
    showClass: {
      popup: 'animate__animated animate__zoomIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__zoomOut animate__faster'
    },
    html: `
      <div class="flex items-center justify-center px-6 py-4 ${bgColor} border-2 ${borderColor} rounded-2xl shadow-2xl min-w-[280px] max-w-sm mx-auto pointer-events-auto">
        ${iconHtml}
        <div class="flex flex-col items-start text-left">
          <span class="text-base font-bold ${titleColor} leading-tight">${title}</span>
          ${text ? `<span class="text-sm ${textColor} opacity-90 truncate max-w-[250px] mt-0.5">${text}</span>` : ''}
        </div>
      </div>
    `
  });
};
