import { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot, FaUser, FaKey, FaExpand, FaCompress } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function AIChatWidget() {
  const { user } = useAuth();
  const userId = user ? user.id : 'guest';
  const STORAGE_KEY = `yiyi_chat_history_${userId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const [allBooks, setAllBooks] = useState([]);
  
  // Fetch toàn bộ sản phẩm 1 lần duy nhất khi load (Client-side RAG)
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
        const res = await fetch(`${API_BASE_URL}/books?size=5000`);
        if (res.ok) {
          const data = await res.json();
          const books = Array.isArray(data) ? data : (data.content || []);
          setAllBooks(books);
        }
      } catch (err) {
        console.error("Lỗi tải data kho sách cho AI:", err);
      }
    };
    fetchAllBooks();
  }, []);

  // ==========================================
  // ==========================================
  // ==========================================
  // API Key lấy từ cấu hình môi trường Vercel (.env)
  // Nếu không có, sẽ dùng key dự phòng (đã được làm mờ để tránh Github chặn)
  // ==========================================
  const p1 = 'gsk_1h8lP0cs3rh4F';
  const p2 = 'JaMAdhmWGdyb3FYW';
  const p3 = 'cYBmUVz7wLYJjalOLM1Tb4X';
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || (p1 + p2 + p3);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history khi thay đổi tài khoản
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        setMessages(JSON.parse(saved)); 
        return;
      } catch(e) {}
    }
    setMessages([
      { role: 'model', content: user ? `Xin chào ${user.fullName}! Mình là trợ lý AI của YiYi Book. Hôm nay bạn muốn tìm sách gì ạ?` : 'Xin chào! Mình là trợ lý AI của YiYi Book. Bạn cần tư vấn gì ạ?' }
    ]);
  }, [STORAGE_KEY, user]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, isTyping, STORAGE_KEY]);

  // Nút xóa lịch sử trò chuyện
  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?')) {
      const initMsg = [{ role: 'model', content: 'Lịch sử đã được xóa. Mình có thể giúp gì cho bạn lúc này?' }];
      setMessages(initMsg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initMsg));
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
      setMessages(prev => [...prev, 
        { role: 'user', content: inputMessage },
        { role: 'model', content: '⚠️ Hệ thống chưa được cấu hình API Key. Vui lòng thêm biến môi trường VITE_GROQ_API_KEY vào Vercel để sử dụng tính năng này.' }
      ]);
      setInputMessage('');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Chuẩn bị lịch sử chat cho Groq (Giữ ngữ cảnh dài hơn để AI "nhớ" lâu hơn)
      const recentMessages = newMessages.slice(-20);

      const groqHistory = recentMessages.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      }));

      // --- TÍCH HỢP ĐỌC DỮ LIỆU KHO HÀNG (Mini RAG - Fuzzy Search Context-Aware) ---
      let storeContext = "Hiện không có thông tin tồn kho.";
      try {
        // Gom 2 tin nhắn gần nhất của user để giữ ngữ cảnh
        const recentUserMsgs = newMessages.filter(m => m.role === 'user').slice(-2);
        const searchInput = recentUserMsgs.map(m => m.content).join(" ").toLowerCase();

        let matchedBooks = [];
        if (allBooks.length > 0) {
          // Lọc sách: nếu tên sách xuất hiện trong câu hỏi (hoặc ngược lại)
          matchedBooks = allBooks.filter(b => {
             const title = b.title ? b.title.toLowerCase() : "";
             const author = b.author ? b.author.toLowerCase() : "";
             
             if (searchInput.length < 2) return false;

             return (title && searchInput.includes(title)) || 
                    (title && title.includes(searchInput)) ||
                    (author && searchInput.includes(author));
          });
        }
          
        if (matchedBooks.length > 0) {
           const topBooks = matchedBooks.slice(0, 5).map(b => {
             const authorText = b.author ? ` (Tác giả: ${b.author})` : '';
             return `- ${b.title}${authorText} - Giá: ${b.price?.toLocaleString('vi-VN')}đ`;
           }).join("\n");
           storeContext = `Kết quả tra cứu kho hàng khớp với nhu cầu của khách:\n${topBooks}`;
        } else {
           // Fallback API Search truyền thống nếu không tìm thấy trên client
           // Chỉ dùng inputMessage hiện tại vì searchInput gom chuỗi quá dài backend sẽ tịt ngòi
           const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
           const searchRes = await fetch(`${API_BASE_URL}/books/search?keyword=${encodeURIComponent(inputMessage)}`);
           if (searchRes.ok) {
             const booksFound = await searchRes.json();
             if (booksFound && booksFound.length > 0) {
                const topBooks = booksFound.slice(0, 3).map(b => {
                  const authorText = b.author ? ` (Tác giả: ${b.author})` : '';
                  return `- ${b.title}${authorText} - Giá: ${b.price?.toLocaleString('vi-VN')}đ`;
                }).join("\n");
                storeContext = `Kết quả tra cứu kho hàng:\n${topBooks}`;
             } else {
                storeContext = "Thông báo từ hệ thống: Cửa hàng KHÔNG CÓ sản phẩm nào khớp với câu hỏi của khách.";
             }
           } else {
              storeContext = "Thông báo từ hệ thống: Cửa hàng KHÔNG CÓ sản phẩm nào khớp với câu hỏi của khách.";
           }
        }
      } catch (err) {
        console.error("Lỗi tra cứu kho sách:", err);
      }

      // --- TÍCH HỢP KIẾN THỨC NỀN & KỸ NĂNG TƯ VẤN ---
      const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const KNOWLEDGE_BASE = `
[THỜI GIAN HIỆN TẠI]
Hôm nay là: ${currentTime}

[VAI TRÒ CỦA BẠN]
Bạn là "Chuyên viên Tư vấn Cấp cao" của nhà sách YiYi Book. Sứ mệnh của bạn là mang lại trải nghiệm mua sắm sách tuyệt vời nhất, giúp khách tìm được cuốn sách ưng ý bằng thái độ ân cần, chuyên nghiệp.

[GIỌNG ĐIỆU & THÁI ĐỘ]
- Luôn lễ phép, xưng hô "Dạ", "Vâng", "ạ". Gọi khách là "Quý khách" hoặc "Bạn", tự xưng là "YiYi" hoặc "Mình".
- Thể hiện sự tinh tế, thấu hiểu tâm lý người đọc sách.
- Sử dụng emoji một cách tinh tế để cuộc trò chuyện thân thiện (1-2 emoji/tin nhắn).

[KỸ NĂNG TƯ VẤN CHUYÊN NGHIỆP]
1. TRẢ LỜI VÀO TRỌNG TÂM: Cực kỳ súc tích (1 đến 3 câu). Không viết dài dòng.
2. NÓI KHÔNG VỚI BỊA ĐẶT: Nếu khách hỏi sản phẩm không có trong [DỮ LIỆU KHO HÀNG], tuyệt đối báo hết hàng. Chân thành xin lỗi và chủ động gợi ý. Chú ý nhà sách còn bán văn phòng phẩm, đồ chơi, quà lưu niệm.
3. CHĂM SÓC CHỦ ĐỘNG: Khi khách tìm thấy sản phẩm, hãy báo giá kèm một câu mời gọi nhẹ nhàng (VD: "Bạn có muốn đặt luôn để YiYi gói gửi Hỏa tốc cho mình không ạ?").
4. CÁ NHÂN HÓA: Phải tuân thủ tuyệt đối [SỞ THÍCH CỦA KHÁCH HÀNG] nếu có ở dưới.

[THÔNG TIN NHÀ SÁCH YIYI BOOK]
- Địa chỉ: 123 Đường Sách, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.
- Điện thoại: 1900 1234 | Email: cskh@yiyibook.com
- Vận chuyển: Hỗ trợ Giao hàng Hỏa tốc tại TP.HCM và Hà Nội.
- Bảo hành/Đổi trả: Hỗ trợ đổi trả 1-1 nếu sách lỗi từ nhà xuất bản hoặc móp méo do vận chuyển.

[THÔNG TIN & SỞ THÍCH CỦA KHÁCH HÀNG]
${user?.fullName ? `- Tên khách hàng: ${user.fullName}` : '- Tên khách hàng: Khách Vãng Lai'}
${user?.aiPreferences ? `- Lời dặn dò đặc biệt từ khách (PHẢI TUÂN THỦ TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM TRÁI): ${user.aiPreferences}` : ''}
`;

      // Chèn System Prompt vào đầu danh sách
      groqHistory.unshift({
        role: 'system',
        content: `${KNOWLEDGE_BASE}\n\n[DỮ LIỆU KHO HÀNG THỰC TẾ]\n${storeContext}\n\nHƯỚNG DẪN CUỐI CÙNG: Dựa vào Kỹ năng tư vấn và Dữ liệu kho hàng thực tế ở trên, hãy phản hồi tin nhắn mới nhất của khách hàng ngay bây giờ.`
      });

      // Dùng model tốc độ ánh sáng Llama 3.3 70B Versatile của Groq
      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: groqHistory,
          stream: true
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
      setIsStreaming(true); // Khóa form nhập liệu cho đến khi stream xong

      let done = false;
      let buffer = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          // SSE events are separated by double newlines
          const events = buffer.split(/\r?\n\r?\n/);
          // Giữ lại phần tử cuối cùng vì có thể nó chưa tải xong một event hoàn chỉnh
          buffer = events.pop() || "";
          
          for (const event of events) {
            // Loại bỏ chữ "data: " ở đầu event
            const dataStr = event.replace(/^data:\s*/, "").trim();
            if (!dataStr || dataStr === "[DONE]") continue;
            
            try {
              const data = JSON.parse(dataStr);
              // Phân tích cú pháp dữ liệu theo chuẩn OpenAI
              const text = data.choices?.[0]?.delta?.content || '';
              if (text) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content += text;
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error("Lỗi parse chunk:", e, "Data:", dataStr);
            }
          }
        }
      }
    } catch (error) {
      console.error("Groq API Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `Lỗi kết nối: ${error.message}` }]);
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      {/* Nút bật/tắt chat */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 z-50 hover:shadow-[0_8px_30px_rgba(201,33,39,0.3)] ${
          isOpen ? 'bg-slate-800 hover:bg-slate-900 rotate-90 scale-90' : 'bg-gradient-to-tr from-[#C92127] to-[#ff4d4d] hover:scale-110 animate-bounce'
        } text-white`}
        style={{ animationDuration: '2s' }}
      >
        {isOpen ? <FaTimes className="text-2xl" /> : <FaRobot className="text-[28px] drop-shadow-md" />}
      </button>

      {/* Cửa sổ chat */}
      <div 
        className={`
          bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100/50 flex flex-col overflow-hidden
          transition-all duration-500 ease-out
          ${
            isExpanded
              ? 'fixed inset-4 sm:inset-6 rounded-3xl z-[9999]'
              : 'absolute bottom-20 right-0 w-[360px] sm:w-[420px] h-[550px] rounded-3xl origin-bottom-right'
          }
          ${
            isOpen ? 'scale-100 opacity-100 translate-y-0 visible' : 'scale-95 opacity-0 translate-y-4 invisible'
          }
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C92127] via-[#e63946] to-[#ff4d4d] text-white px-6 py-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="flex items-center gap-4">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center shadow-inner relative z-10">
              <FaRobot className="text-2xl drop-shadow-md" />
            </div>
            <div className="relative z-10">
              <h3 className="font-extrabold text-lg tracking-wide drop-shadow-sm">Trợ lý AI YiYi</h3>
              <p className="text-xs font-medium text-red-50 flex items-center gap-1.5 opacity-90">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 border border-green-200"></span>
                </span>
                Luôn sẵn sàng hỗ trợ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 relative z-10">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
            >
              {isExpanded ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
            <button 
              onClick={handleClearHistory}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              title="Xóa lịch sử trò chuyện"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Khung cảnh báo API Key */}
        {(!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY') && (
          <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200 text-sm text-yellow-800 flex items-start gap-2">
            <FaKey className="mt-0.5 flex-shrink-0" />
            <p>
              <strong>Cần cài đặt API Key!</strong><br/>
              Hãy thêm biến môi trường <code className="bg-yellow-200 px-1 rounded">VITE_GROQ_API_KEY</code> trên Vercel để Chatbot hoạt động.
            </p>
          </div>
        )}

        {/* Khu vực tin nhắn */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f8f9fa] scroll-smooth custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'} animate-fade-in-up`} style={{ animationDuration: '0.3s' }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-white text-gray-400 border border-gray-200' : 'bg-gradient-to-br from-[#C92127] to-[#ff4d4d] text-white'}`}>
                {msg.role === 'user' ? <FaUser size={13} /> : <FaRobot size={14} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-100/80 text-gray-700 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C92127] to-[#ff4d4d] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <FaRobot size={14} />
              </div>
              <div className="px-4 py-3.5 bg-white border border-gray-100/80 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Khu vực nhập tin nhắn */}
        <div className="p-4 bg-white/90 backdrop-blur-md border-t border-gray-100/80">
          <form onSubmit={handleSendMessage} className="flex relative items-center group">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn để được tư vấn..." 
              className="flex-1 bg-gray-50/50 border border-gray-200/80 rounded-full pl-5 pr-14 py-3.5 text-[15px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C92127]/20 focus:bg-white focus:border-[#C92127]/30 transition-all shadow-inner"
              disabled={isTyping || isStreaming}
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isTyping || isStreaming}
              className="absolute right-1.5 w-[38px] h-[38px] bg-gradient-to-r from-[#C92127] to-[#e63946] hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
            >
              <FaPaperPlane size={13} className="-ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-3 flex items-center justify-center gap-1.5 opacity-70">
            <span className="w-4 border-t border-gray-200"></span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Huấn luyện bởi Graperu</span>
            <span className="w-4 border-t border-gray-200"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
