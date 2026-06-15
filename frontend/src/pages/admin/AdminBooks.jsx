import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaExclamationTriangle,
  FaBook,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCombo, setIsCombo] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, catsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/books`),
        axios.get(`${API_BASE_URL}/categories`)
      ]);
      setBooks(booksRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) {
      console.error('Error fetching admin books data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: 'Có lỗi xảy ra khi đồng bộ danh sách sách từ máy chủ.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setOldPrice('');
    setDiscount('0');
    setStockQuantity('');
    setImageUrl('');
    setIsCombo(false);
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setTitle(book.title || '');
    setAuthor(book.author || '');
    setDescription(book.description || '');
    setCategoryId(book.category?.id || categories[0]?.id || '');
    setPrice(book.price ? book.price.toString() : '');
    setOldPrice(book.oldPrice ? book.oldPrice.toString() : '');
    setDiscount(book.discount ? book.discount.toString() : '0');
    setStockQuantity(book.stockQuantity ? book.stockQuantity.toString() : '');
    setImageUrl(book.imageUrl || '');
    setIsCombo(book.isCombo || false);
    setIsModalOpen(true);
  };

  const handleDelete = (id, bookTitle) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: `Sách "${bookTitle}" sẽ bị xóa vĩnh viễn khỏi hệ thống!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/books/${id}`);
          setBooks(prev => prev.filter(b => b.id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Sách đã được xóa khỏi hệ thống.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Error deleting book:', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi xóa sách',
            text: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !stockQuantity) {
      return Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin bắt buộc',
        text: 'Vui lòng điền tiêu đề, giá bán và số lượng trong kho.'
      });
    }

    const payload = {
      title,
      author,
      description,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      discount: parseInt(discount) || 0,
      stockQuantity: parseInt(stockQuantity) || 0,
      imageUrl,
      isCombo,
      category: categoryId ? { id: parseInt(categoryId) } : null
    };

    try {
      if (editingBook) {
        // Cập nhật
        const res = await axios.put(`${API_BASE_URL}/books/${editingBook.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công',
          text: `Sách "${title}" đã được cập nhật.`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Tạo mới
        const res = await axios.post(`${API_BASE_URL}/books`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Thêm mới thành công',
          text: `Sách "${title}" đã được lưu vào hệ thống.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving book:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi lưu thông tin',
        text: error.response?.data?.message || 'Không thể lưu sách. Vui lòng thử lại.'
      });
    }
  };

  // Lọc sách
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === '' || book.category?.id?.toString() === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Sách</h2>
          <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin chi tiết, giá bán, tồn kho các đầu sách.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white hover:bg-primary-light font-medium py-2.5 px-5 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <FaPlus />
          <span>Thêm sách mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-150 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tiêu đề sách hoặc tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-all text-sm"
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-all text-sm bg-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Không tìm thấy cuốn sách nào khớp với bộ lọc.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-250">
                  <th className="px-6 py-4">Hình ảnh</th>
                  <th className="px-6 py-4">Tên Sách & Tác giả</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Đơn giá</th>
                  <th className="px-6 py-4">Kho hàng</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/40">
                    <td className="px-6 py-4 shrink-0">
                      <div className="w-12 h-16 bg-gray-50 rounded border border-gray-150 flex items-center justify-center overflow-hidden">
                        <img 
                          src={book.imageUrl || book.img || 'https://placehold.co/100'} 
                          alt={book.title} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs">
                      <div className="truncate font-semibold text-gray-900">{book.title}</div>
                      <div className="text-xs text-gray-400 mt-1">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-650">{book.category?.name || 'Chưa phân loại'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary">{book.price.toLocaleString('vi-VN')} đ</div>
                      {book.oldPrice && (
                        <div className="text-xs text-gray-400 line-through mt-0.5">{book.oldPrice.toLocaleString('vi-VN')} đ</div>
                      )}
                      {book.discount > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-red-100 text-red-600 px-1 rounded">-{book.discount}%</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {book.stockQuantity <= 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-650 bg-red-50 px-2 py-0.5 rounded-full">
                          <FaExclamationTriangle className="text-[10px]" /> Hết hàng
                        </span>
                      ) : book.stockQuantity <= 5 ? (
                        <div>
                          <div className="font-medium text-yellow-650">{book.stockQuantity} cuốn</div>
                          <span className="text-[10px] text-yellow-600 font-semibold bg-yellow-50 px-1.5 py-0.5 rounded-full">Tồn kho thấp</span>
                        </div>
                      ) : (
                        <span className="text-gray-700 font-medium">{book.stockQuantity} cuốn</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {book.isCombo ? (
                        <span className="text-[11px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Combo</span>
                      ) : (
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-650 px-2 py-0.5 rounded-full">Đơn lẻ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(book)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(book.id, book.title)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-150 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaBook className="text-primary" />
                {editingBook ? 'Cập nhật thông tin sách' : 'Thêm sách mới vào hệ thống'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Tiêu đề & Tác giả */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Tiêu đề sách *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Nhập tên sách..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Tác giả</label>
                  <input 
                    type="text" 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nhập tên tác giả..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Mô tả chi tiết</label>
                <textarea 
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Viết tóm tắt nội dung sách..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Danh mục & Phân loại Combo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Danh mục thuộc về</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 h-full sm:pt-6">
                  <input 
                    type="checkbox"
                    id="isCombo"
                    checked={isCombo}
                    onChange={(e) => setIsCombo(e.target.checked)}
                    className="w-4.5 h-4.5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="isCombo" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">Sách thuộc thể loại Combo (bán bộ)</label>
                </div>
              </div>

              {/* Giá bán, Giá cũ, % Giảm giá */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Giá bán hiện tại * (đ)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    placeholder="Ví dụ: 89000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Giá niêm yết cũ (đ)</label>
                  <input 
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    min="0"
                    placeholder="Không giảm giá để trống"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Phần trăm giảm (%)</label>
                  <input 
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Số lượng tồn kho & Đường dẫn ảnh */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Số lượng trong kho *</label>
                  <input 
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    required
                    min="0"
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Đường dẫn ảnh bìa (URL)</label>
                  <input 
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="http://example.com/cover.jpg"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Bảng xem trước ảnh */}
              {imageUrl && (
                <div className="border border-gray-150 p-2.5 rounded-lg flex items-center gap-3">
                  <img src={imageUrl} alt="Preview" className="w-12 h-16 object-contain border bg-gray-50 rounded" />
                  <div>
                    <span className="text-[11px] font-bold text-green-650 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                      <FaCheck /> Hợp lệ
                    </span>
                    <p className="text-[11px] text-gray-450 mt-1 truncate max-w-md">Ảnh xem trước tải thành công.</p>
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="pt-4 border-t border-gray-150 flex justify-end gap-3.5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition-all text-sm cursor-pointer"
                >
                  {editingBook ? 'Cập nhật sách' : 'Thêm sách'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
