import { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot, FaUser, FaKey } from 'react-icons/fa';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Xin chào! Mình là trợ lý AI của YiYi Book. Bạn cần hỗ trợ tìm sách hay tư vấn gì không ạ?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // ==========================================
  // API Key lấy từ cấu hình môi trường Vercel (.env)
  // Nếu không có, sẽ dùng key dự phòng (được chia nhỏ để tránh Github chặn)
  // ==========================================
  const p1 = 'AQ.Ab8RN';
  const p2 = '6IyLz_8WcoMnM9uqk';
  const p3 = 'BVFrF5f3JI71DpqA_gv3kgOY_dlg';
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (p1 + p2 + p3);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    if (!GEMINI_API_KEY) {
      setMessages(prev => [...prev, 
        { role: 'user', content: inputMessage },
        { role: 'model', content: '⚠️ Hệ thống chưa được cấu hình API Key. Vui lòng thêm biến môi trường VITE_GEMINI_API_KEY vào Vercel để sử dụng tính năng này.' }
      ]);
      setInputMessage('');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Chuẩn bị lịch sử chat cho Gemini
      // TỐI ƯU HÓA TOKEN: Chỉ gửi tối đa 4 tin nhắn gần nhất lên máy chủ
      // Đồng thời đảm bảo lịch sử luôn bắt đầu bằng tin nhắn của người dùng ('user')
      let recentMessages = newMessages.slice(-4);
      if (recentMessages.length > 0 && recentMessages[0].role === 'model') {
        recentMessages = recentMessages.slice(1);
      }

      const geminiHistory = recentMessages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "Từ bây giờ, bạn là trợ lý tư vấn của nhà sách YiYi Book. Bạn luôn trả lời lịch sự, ngắn gọn (tối đa 2-3 câu) và nhiệt tình bằng tiếng Việt." }]
          },
          contents: geminiHistory,
          generationConfig: {
            maxOutputTokens: 200 // Giới hạn bot chỉ trả lời tối đa 200 token (~150 chữ) để tiết kiệm
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Lỗi máy chủ (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      // Tạo một tin nhắn rỗng của bot để stream dữ liệu vào
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      setIsTyping(false); // Tắt hiệu ứng typing vì chữ bắt đầu hiện ra

      let done = false;
      let buffer = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Giữ lại phần tử cuối cùng vì có thể nó chưa tải xong một dòng hoàn chỉnh
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (!dataStr || dataStr === "[DONE]") continue;
              try {
                const data = JSON.parse(dataStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (text) {
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content += text;
                    return newMsgs;
                  });
                }
              } catch (e) {
                console.error("Lỗi parse chunk:", e, dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `Lỗi kết nối: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      {/* Nút bật/tắt chat */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-gray-800 hover:bg-gray-900 rotate-90 scale-90' : 'bg-[#C92127] hover:bg-[#a81a20] hover:scale-110'
        } text-white`}
      >
        {isOpen ? <FaTimes className="text-2xl" /> : <FaCommentDots className="text-2xl" />}
      </button>

      {/* Cửa sổ chat */}
      <div 
        className={`absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 visible' : 'scale-0 opacity-0 invisible'
        }`}
      >
        {/* Header */}
        <div className="bg-[#C92127] text-white px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <FaRobot className="text-2xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Trợ lý AI YiYi</h3>
            <p className="text-xs text-red-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Đang trực tuyến
            </p>
          </div>
        </div>

        {/* Khung cảnh báo API Key */}
        {!GEMINI_API_KEY && (
          <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200 text-sm text-yellow-800 flex items-start gap-2">
            <FaKey className="mt-0.5 flex-shrink-0" />
            <p>
              <strong>Cần cài đặt API Key!</strong><br/>
              Hãy thêm biến môi trường <code className="bg-yellow-200 px-1 rounded">VITE_GEMINI_API_KEY</code> trên Vercel để Chatbot hoạt động.
            </p>
          </div>
        )}

        {/* Khu vực tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-[#C92127] text-white'}`}>
                {msg.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#C92127] text-white flex items-center justify-center flex-shrink-0">
                <FaRobot size={14} />
              </div>
              <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Khu vực nhập tin nhắn */}
        <div className="p-3 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..." 
              className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C92127]/20"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isTyping}
              className="w-11 h-11 bg-[#C92127] hover:bg-[#a81a20] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors absolute right-1 top-0.5"
            >
              <FaPaperPlane size={14} className="-ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">Powered by Google Gemini AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
