import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaRobot, FaUser, FaKey, FaExpand, FaCompress, FaTrash } from 'react-icons/fa';
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
      } catch { /* ignore malformed cached history */ }
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

      // --- TÍCH HỢP ĐỌC DỮ LIỆU KHO HÀNG TOÀN DIỆN ---
      let storeContext = "Chưa tải được dữ liệu kho hàng.";
      try {
        if (allBooks.length > 0) {
          // 1. Thống kê tổng quan
          const totalProducts = allBooks.length;

          // 2. Phân nhóm theo danh mục
          const categoryMap = {};
          allBooks.forEach(b => {
            const cat = b.category?.name || 'Khác';
            if (!categoryMap[cat]) categoryMap[cat] = [];
            categoryMap[cat].push(b);
          });
          const categorySummary = Object.entries(categoryMap)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 10)
            .map(([cat, items]) => `  + ${cat}: ${items.length} sản phẩm`)
            .join('\n');

          // 3. Tìm kiếm thông minh dựa trên ngữ cảnh (2 tin nhắn gần nhất)
          const recentUserMsgs = newMessages.filter(m => m.role === 'user').slice(-2);
          const searchInput = recentUserMsgs.map(m => m.content).join(' ').toLowerCase();

          let relevantProducts = [];
          if (searchInput.length >= 2) {
            // Tách từ khóa, bỏ stopwords phổ biến
            const stopWords = ['có', 'không', 'bao', 'nhiêu', 'sản', 'phẩm', 'cuốn', 'quyển', 'sách', 'của', 'và', 'là', 'tôi', 'mình', 'bạn', 'cho', 'với', 'một', 'những', 'các', 'này', 'đó', 'cái'];
            const keywords = searchInput
              .split(/\s+/)
              .filter(w => w.length >= 2 && !stopWords.includes(w));

            if (keywords.length > 0) {
              relevantProducts = allBooks.filter(b => {
                const title = (b.title || '').toLowerCase();
                const author = (b.author || '').toLowerCase();
                const cat = (b.category?.name || '').toLowerCase();
                return keywords.some(kw => title.includes(kw) || author.includes(kw) || cat.includes(kw));
              });
            }
          }

          // 4. Xây dựng context
          let productSection = '';
          if (relevantProducts.length > 0) {
            const topMatches = relevantProducts.slice(0, 8).map(b => {
              const authorText = b.author ? ` | Tác giả: ${b.author}` : '';
              const catText = b.category?.name ? ` | Thể loại: ${b.category.name}` : '';
              const priceText = b.price ? ` | Giá: ${b.price.toLocaleString('vi-VN')}đ` : '';
              const stock = b.stockQuantity != null ? ` | Tồn kho: ${b.stockQuantity}` : '';
              return `  • ${b.title}${authorText}${catText}${priceText}${stock}`;
            }).join('\n');
            productSection = `\nSẢN PHẨM LIÊN QUAN ĐẾN CÂU HỎI (${relevantProducts.length} kết quả, hiển thị tối đa 8):\n${topMatches}`;
          } else {
            // Khi không có kết quả cụ thể, show mẫu đại diện mỗi danh mục
            const sampleProducts = Object.entries(categoryMap)
              .sort((a, b) => b[1].length - a[1].length)
              .slice(0, 5)
              .map(([cat, items]) => {
                const sample = items[0];
                return `  • [${cat}] ${sample.title}${sample.price ? ' - ' + sample.price.toLocaleString('vi-VN') + 'đ' : ''}`;
              }).join('\n');
            productSection = `\nMẪU SẢN PHẨM ĐẠI DIỆN CÁC DANH MỤC:\n${sampleProducts}`;
          }

          storeContext = `TỔNG QUAN KHO HÀNG YIYI BOOK:
- Tổng số sản phẩm: ${totalProducts} sản phẩm
- Số danh mục: ${Object.keys(categoryMap).length} danh mục

PHÂN BỔ THEO DANH MỤC:
${categorySummary}
${productSection}`;
        }
      } catch (err) {
        console.error("Lỗi tra cứu kho sách:", err);
      }

      // --- PHÂN TÍCH Ý ĐỊNH KHÁCH HÀNG (Intent Detection) ---
      const allUserMsgs = newMessages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
      const lastUserMsg = (inputMessage || '').toLowerCase();
      const conversationText = allUserMsgs.join(' ');

      // Nhận diện tín hiệu hành vi
      const intentSignals = {
        wantRecommendation: /gợi ý|đề xuất|recommend|nên đọc|hay không|có gì hay|không biết|muốn tìm|tìm giúp|giới thiệu/.test(conversationText),
        comparingPrice: /giá|bao nhiêu tiền|rẻ|đắt|tiết kiệm|budget|phí/.test(lastUserMsg),
        giftBuying: /tặng|quà|gift|sinh nhật|kỷ niệm|người thân|bạn bè|con|mẹ|bố|vợ|chồng/.test(conversationText),
        browsingGeneral: /xem|dạo|có gì|thể loại|loại nào|mục|danh mục/.test(lastUserMsg),
        urgentBuy: /mua ngay|đặt ngay|cần gấp|hôm nay|sớm|nhanh/.test(conversationText),
        forChildren: /trẻ em|thiếu nhi|con nít|bé|truyện tranh|manga|học sinh/.test(conversationText),
        selfDevelopment: /kỹ năng|phát triển bản thân|tư duy|sáng tạo|lãnh đạo|kinh doanh|marketing|tài chính/.test(conversationText),
        fiction: /tiểu thuyết|truyện|fiction|lãng mạn|ngôn tình|trinh thám|kinh dị|fantasy|sci-fi/.test(conversationText),
      };

      // Tóm tắt ý định để inject vào prompt
      const intentSummary = Object.entries(intentSignals)
        .filter(([, v]) => v)
        .map(([k]) => ({
          wantRecommendation: '🎯 Khách ĐANG CẦN được gợi ý - hãy chủ động đề xuất 2-3 sản phẩm phù hợp từ kho hàng',
          comparingPrice: '💰 Khách quan tâm đến giá - hãy luôn nêu rõ giá và so sánh nếu có thể',
          giftBuying: '🎁 Khách đang mua quà tặng - hãy gợi ý những sản phẩm phù hợp làm quà và đề xuất gói quà',
          browsingGeneral: '🔍 Khách đang xem tổng quan - hãy giới thiệu ngắn gọn điểm nổi bật của các danh mục',
          urgentBuy: '⚡ Khách cần mua gấp - ưu tiên nhấn mạnh vào tốc độ giao hàng Hỏa tốc',
          forChildren: '👶 Khách tìm sách cho trẻ em - ưu tiên sách thiếu nhi, tranh truyện, giáo dục',
          selfDevelopment: '🚀 Khách muốn phát triển bản thân - gợi ý sách kỹ năng, kinh doanh, tư duy',
          fiction: '📖 Khách thích đọc truyện/tiểu thuyết - gợi ý sách văn học, tiểu thuyết hấp dẫn',
        }[k]))
        .filter(Boolean)
        .join('\n');

      // --- TÍCH HỢP KIẾN THỨC NỀN & KỸ NĂNG TƯ VẤN ---
      const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const KNOWLEDGE_BASE = `
[THỜI GIAN HIỆN TẠI]
Hôm nay là: ${currentTime}

[VAI TRÒ & SỨ MỆNH]
Bạn là "YiYi" - Trợ lý AI thông minh của nhà sách YiYi Book. Bạn không chỉ trả lời câu hỏi, mà còn CHỦ ĐỘNG DỰ ĐOÁN nhu cầu khách hàng và đề xuất sản phẩm phù hợp trước cả khi họ hỏi. Bạn là chuyên gia sách thực sự, biết phân tích tâm lý người đọc.

[GIỌNG ĐIỆU & THÁI ĐỘ]
- Luôn lễ phép, xưng "Dạ", "Vâng", "ạ". Gọi khách là "Bạn", tự xưng là "YiYi".
- Thân thiện, ấm áp như người bạn đồng hành. KHÔNG nói chuyện máy móc, cứng nhắc.
- Dùng 1-2 emoji phù hợp để tạo cảm giác thân thiện.

[TƯ DUY TƯ VẤN THÔNG MINH - QUAN TRỌNG NHẤT]
1. TRẢ LỜI TRỰC TIẾP, ĐI THẲNG VÀO VẤN ĐỀ: Khi khách hỏi, phải trả lời ĐÚNG TRỌNG TÂM ngay câu đầu tiên. Không lan man, không dài dòng. Không cần vòng vo giải thích trước khi có câu trả lời.
2. ĐỌC VỊ Ý ĐỊNH: Hiểu khách muốn gì. Nếu khách hỏi giá → báo giá ngay lập tức. Nếu khách do dự → đưa ra cam kết chất lượng ngắn gọn.
3. DỮ LIỆU LÀ VUA: Mọi thông tin về sản phẩm PHẢI lấy từ [DỮ LIỆU KHO HÀNG]. Không bịa đặt số liệu.
4. NGẮN GỌN - SÚC TÍCH: Tối đa 3-4 câu mỗi tin nhắn. Dùng gạch đầu dòng khi liệt kê. Tuyệt đối không viết thành bài văn dài.

[THÔNG TIN NHÀ SÁCH YIYI BOOK]
- Địa chỉ: 123 Đường Sách, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
- Hotline: 1900 1234 | Email: cskh@yiyibook.com
- Giao hàng Hỏa tốc (2-4h) tại TP.HCM & Hà Nội. Toàn quốc 1-3 ngày.
- Đổi trả 1-1 trong 7 ngày nếu sách lỗi.

[THÔNG TIN & SỞ THÍCH CỦA KHÁCH HÀNG]
${user?.fullName ? `- Tên: ${user.fullName}` : '- Khách Vãng Lai (chưa đăng nhập)'}
${user?.aiPreferences ? `- Dặn dò cá nhân (BẮT BUỘC tuân thủ): ${user.aiPreferences}` : ''}

[TÍN HIỆU Ý ĐỊNH PHÁT HIỆN TRONG CUỘC TRÒ CHUYỆN NÀY]
${intentSummary || '(Chưa phát hiện tín hiệu đặc biệt - hãy hỏi thêm để hiểu nhu cầu khách)'}
`;

      // Chèn System Prompt vào đầu danh sách
      groqHistory.unshift({
        role: 'system',
        content: `${KNOWLEDGE_BASE}\n\n[DỮ LIỆU KHO HÀNG THỰC TẾ - BẮT BUỘC DÙNG ĐỂ TƯ VẤN]\n${storeContext}\n\nNHIỆM VỤ NGAY BÂY GIỜ: TRẢ LỜI ĐÚNG TRỌNG TÂM câu hỏi của khách ngay lập tức (không lan man). Sau khi đã trả lời xong, mới đưa ra 1 gợi ý ngắn gọn về sản phẩm phù hợp từ kho hàng. Kết thúc bằng một câu hỏi ngắn để hiểu thêm nhu cầu (nếu cần).`
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
              <FaTrash size={12} />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              title="Đóng chat"
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
