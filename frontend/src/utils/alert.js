import Swal from 'sweetalert2';

export const showNotification = (title, text, type = 'success') => {
  return Swal.fire({
    toast: false,
    position: 'center',
    icon: type,
    iconColor: type === 'success' ? '#ef4444' : (type === 'error' ? '#ef4444' : '#3b82f6'),
    title: title || 'Thông báo',
    text: text,
    showConfirmButton: true,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    timer: 2000,
    timerProgressBar: true,
    backdrop: `rgba(0,0,0,0.5)`,
    customClass: {
      popup: '!bg-white !rounded-2xl !shadow-2xl !p-8 w-[400px]',
      title: '!text-gray-800 !font-bold !text-2xl !mt-6',
      htmlContainer: '!text-gray-600 !text-base !mt-2 !mb-8',
      confirmButton: '!px-12 !py-3 !rounded-lg !font-bold !text-white !bg-red-600 hover:!bg-red-700 !transition-colors !shadow-md !w-full sm:!w-auto',
      timerProgressBar: '!bg-red-200'
    }
  });
};
