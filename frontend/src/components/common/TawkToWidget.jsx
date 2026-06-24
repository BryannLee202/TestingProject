import { useEffect, useState } from 'react';
import { FaCommentDots, FaTimes } from 'react-icons/fa';

export default function TawkToWidget() {
  const [showSetupInstruction, setShowSetupInstruction] = useState(false);

  useEffect(() => {
    // You can replace 'YOUR_PROPERTY_ID' with your actual Tawk.to Property ID
    // Example: '65b263b60ff6374032c4e339/1hl23456'
    const propertyId = '6a3b8fe105d9c61d3e7e419b/1jrsak35c'; 

    if (propertyId === 'YOUR_PROPERTY_ID') {
      // If no ID is set, we show our setup instruction button instead
      setShowSetupInstruction(true);
      return;
    }

    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/default`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (showSetupInstruction) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fade-in-up">
        <div className="bg-white rounded-lg shadow-2xl p-4 mb-4 max-w-sm border border-gray-100 relative">
          <button 
            onClick={() => setShowSetupInstruction(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
          <h3 className="font-bold text-[#C92127] mb-2 flex items-center gap-2">
            <FaCommentDots /> Cấu hình Tawk.to Chatbot
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Tính năng chat đã được tích hợp sẵn. Để kích hoạt Live Chat & Bot:
          </p>
          <ol className="text-sm text-gray-600 list-decimal pl-4 space-y-1 mb-3">
            <li>Tạo tài khoản miễn phí tại <a href="https://tawk.to" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">tawk.to</a></li>
            <li>Copy Property ID của bạn</li>
            <li>Mở file <code className="bg-gray-100 px-1 rounded text-[#C92127]">src/components/common/TawkToWidget.jsx</code></li>
            <li>Sửa chữ <code className="bg-gray-100 px-1 rounded text-[#C92127]">YOUR_PROPERTY_ID</code> thành ID của bạn.</li>
          </ol>
          <p className="text-xs text-gray-400 italic">Khung này sẽ tự biến mất sau khi bạn nhập đúng ID.</p>
        </div>
        <button 
          onClick={() => setShowSetupInstruction(true)}
          className="w-14 h-14 bg-[#27B24B] hover:bg-[#1E8A3A] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        >
          <FaCommentDots className="text-2xl" />
        </button>
      </div>
    );
  }

  return null;
}
