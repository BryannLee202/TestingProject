// Admin JavaScript với Authentication
class AdminApp {
    constructor() {
        if (!this.checkAuth()) {
            return;
        }
        this.currentSection = 'dashboard';
        this.init();
    }

    checkAuth() {
        if (!window.adminAuth || !window.adminAuth.requireAuth()) {
            return false;
        }
        return true;
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.showSection('dashboard');
        this.displayUserInfo();
    }

    displayUserInfo() {
        const user = window.adminAuth.getCurrentUser();
        if (user) {
            const userElement = document.querySelector('.admin-user span');
            if (userElement) {
                userElement.textContent = `Xin chào, ${user.name}`;
            }
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.admin-sidebar').classList.toggle('collapsed');
            });
        }

        // Form submissions
        const bookForm = document.getElementById('book-form');
        const categoryForm = document.getElementById('category-form');
        const promotionForm = document.getElementById('promotion-form');

        if (bookForm) bookForm.addEventListener('submit', (e) => this.handleBookSubmit(e));
        if (categoryForm) categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
        if (promotionForm) promotionForm.addEventListener('submit', (e) => this.handlePromotionSubmit(e));
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update page title
        const pageTitle = document.getElementById('page-title');
        const navLink = document.querySelector(`[data-section="${section}"]`);
        if (pageTitle && navLink) {
            pageTitle.textContent = navLink.textContent;
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        if (navLink) {
            navLink.classList.add('active');
        }

        // Load section data
        this.currentSection = section;
        this.loadSectionData(section);
    }

    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'books':
                this.loadBooks();
                break;
            case 'categories':
                this.loadCategories();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'promotions':
                this.loadPromotions();
                break;
            case 'contacts':
                this.loadContacts();
                break;
            case 'support':
                this.loadSupportTickets();
                break;
            case 'careers':
                this.loadJobApplications();
                break;
        }
    }

    async loadDashboard() {
        try {
            const stats = await this.getDashboardStats();
            this.updateDashboardStats(stats);
            this.renderCharts(stats);
            this.loadRecentOrders();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async getDashboardStats() {
        return {
            totalOrders: 156,
            totalBooks: 89,
            totalUsers: 423,
            totalRevenue: 45250000,
            monthlyRevenue: [1200000, 1800000, 1500000, 2200000, 1900000, 2500000, 2800000, 3200000, 3000000, 3500000, 3800000, 4200000],
            bestsellers: [
                { name: 'Nhà giả kim', sales: 45 },
                { name: 'Đắc Nhân Tâm', sales: 38 },
                { name: 'Clean Code', sales: 32 },
                { name: 'Harry Potter', sales: 28 },
                { name: 'Dune', sales: 25 }
            ]
        };
    }

    updateDashboardStats(stats) {
        const setTextContent = (id, text) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        };

        setTextContent('total-orders', stats.totalOrders);
        setTextContent('total-books', stats.totalBooks);
        setTextContent('total-users', stats.totalUsers);
        setTextContent('total-revenue', this.formatCurrency(stats.totalRevenue));
    }

    renderCharts(stats) {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            new Chart(revenueCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
                    datasets: [{
                        label: 'Doanh thu',
                        data: stats.monthlyRevenue,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return (value / 1000000) + ' tr';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Bestsellers Chart
        const bestsellersCtx = document.getElementById('bestsellersChart');
        if (bestsellersCtx) {
            new Chart(bestsellersCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: stats.bestsellers.map(b => b.name),
                    datasets: [{
                        label: 'Số lượng bán',
                        data: stats.bestsellers.map(b => b.sales),
                        backgroundColor: '#27ae60'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    async loadRecentOrders() {
        const orders = await this.getRecentOrders();
        const container = document.getElementById('recent-orders');
        if (container) {
            container.innerHTML = orders.map(order => `
                <div class="activity-item">
                    <div class="activity-info">
                        <strong>${order.orderNumber}</strong>
                        <span> - ${order.customerName}</span>
                    </div>
                    <div class="activity-meta">
                        <span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span>
                        <span>${this.formatCurrency(order.amount)}</span>
                        <span>${this.formatDate(order.date)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    async loadBooks() {
        try {
            const books = await this.getBooks();
            const tbody = document.getElementById('books-tbody');
            if (tbody) {
                tbody.innerHTML = books.map(book => `
                    <tr>
                        <td>${book.id}</td>
                        <td><img src="${book.image_url || '/images/placeholder.jpg'}" alt="${book.title}" class="book-image"></td>
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${this.formatCurrency(book.price)}</td>
                        <td>${book.stock_quantity}</td>
                        <td>
                            <span class="status-badge ${book.stock_quantity > 0 ? 'status-delivered' : 'status-cancelled'}">
                                ${book.stock_quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="admin.editBook(${book.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="admin.deleteBook(${book.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading books:', error);
        }
    }

    async loadCategories() {
        try {
            const categories = await this.getCategories();
            const tbody = document.getElementById('categories-tbody');
            if (tbody) {
                tbody.innerHTML = categories.map(cat => `
                    <tr>
                        <td>${cat.id}</td>
                        <td>${cat.name}</td>
                        <td>${cat.description || 'N/A'}</td>
                        <td>${cat.book_count || 0}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="admin.editCategory(${cat.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="admin.deleteCategory(${cat.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadUsers() {
        try {
            const users = await this.getUsers();
            const tbody = document.getElementById('users-tbody');
            if (tbody) {
                tbody.innerHTML = users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>
                            <span class="status-badge ${user.role === 'admin' ? 'status-delivered' : 'status-pending'}">
                                ${user.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
                            </span>
                        </td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${this.formatDate(user.created_at)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-danger" onclick="admin.deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadOrders() {
        try {
            const statusFilter = document.getElementById('order-status-filter');
            const status = statusFilter ? statusFilter.value : '';
            const orders = await this.getOrders(status);
            const tbody = document.getElementById('orders-tbody');
            if (tbody) {
                tbody.innerHTML = orders.map(order => `
                    <tr>
                        <td>${order.order_number}</td>
                        <td>${order.customer_name}</td>
                        <td>${this.formatCurrency(order.total_amount)}</td>
                        <td>
                            <span class="status-badge status-${order.status}">
                                ${this.getStatusText(order.status)}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge ${order.payment_status === 'paid' ? 'status-delivered' : 'status-pending'}">
                                ${order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </span>
                        </td>
                        <td>${this.formatDate(order.created_at)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="admin.viewOrder(${order.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-success" onclick="admin.updateOrderStatus(${order.id}, 'confirmed')">
                                    <i class="fas fa-check"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    async loadPromotions() {
        try {
            const promotions = await this.getPromotions();
            const tbody = document.getElementById('promotions-tbody');
            if (tbody) {
                tbody.innerHTML = promotions.map(promo => `
                    <tr>
                        <td>${promo.code}</td>
                        <td>${promo.name}</td>
                        <td>
                            ${promo.discount_type === 'percentage' ? 
                              `${promo.discount_value}%` : 
                              this.formatCurrency(promo.discount_value)}
                        </td>
                        <td>${this.formatDate(promo.start_date)}</td>
                        <td>${this.formatDate(promo.end_date)}</td>
                        <td>${promo.used_count}/${promo.usage_limit || '∞'}</td>
                        <td>
                            <span class="status-badge ${promo.is_active ? 'status-delivered' : 'status-cancelled'}">
                                ${promo.is_active ? 'Đang hoạt động' : 'Đã kết thúc'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="admin.editPromotion(${promo.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="admin.deletePromotion(${promo.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
        }
    }

    async loadContacts() {
        try {
            const contacts = await this.getContacts();
            const tbody = document.getElementById('contacts-tbody');
            if (tbody) {
                tbody.innerHTML = contacts.map(contact => `
                    <tr>
                        <td>${contact.id}</td>
                        <td>${contact.name}</td>
                        <td>${contact.email}</td>
                        <td>${contact.subject}</td>
                        <td>
                            <span class="status-badge status-${contact.status}">
                                ${this.getContactStatusText(contact.status)}
                            </span>
                        </td>
                        <td>${this.formatDate(contact.created_at)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="admin.viewContact(${contact.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-success" onclick="admin.updateContactStatus(${contact.id}, 'read')">
                                    <i class="fas fa-check"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    }

    async loadSupportTickets() {
        try {
            const tickets = await this.getSupportTickets();
            const tbody = document.getElementById('support-tbody');
            if (tbody) {
                tbody.innerHTML = tickets.map(ticket => `
                    <tr>
                        <td>${ticket.id}</td>
                        <td>${ticket.customer_name || 'N/A'}</td>
                        <td>${ticket.issue_type}</td>
                        <td>
                            <span class="status-badge priority-${ticket.priority}">
                                ${this.getPriorityText(ticket.priority)}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge status-${ticket.status}">
                                ${this.getSupportStatusText(ticket.status)}
                            </span>
                        </td>
                        <td>${this.formatDate(ticket.created_at)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="admin.viewSupportTicket(${ticket.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-success" onclick="admin.updateSupportStatus(${ticket.id}, 'in_progress')">
                                    <i class="fas fa-cog"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading support tickets:', error);
        }
    }

    async loadJobApplications() {
        try {
            const applications = await this.getJobApplications();
            const tbody = document.getElementById('applications-tbody');
            if (tbody) {
                tbody.innerHTML = applications.map(app => `
                    <tr>
                        <td>${app.id}</td>
                        <td>${app.name}</td>
                        <td>${app.position}</td>
                        <td>${app.experience || 'N/A'}</td>
                        <td>${app.email}</td>
                        <td>${app.phone}</td>
                        <td>
                            <span class="status-badge status-${app.status}">
                                ${this.getApplicationStatusText(app.status)}
                            </span>
                        </td>
                        <td>${this.formatDate(app.created_at)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-primary" onclick="admin.viewApplication(${app.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-success" onclick="admin.updateApplicationStatus(${app.id}, 'reviewed')">
                                    <i class="fas fa-check"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading job applications:', error);
        }
    }

    // Modal functions
    showBookModal(bookId = null) {
        const modal = document.getElementById('book-modal');
        const title = document.getElementById('book-modal-title');
        
        if (modal && title) {
            if (bookId) {
                title.textContent = 'Chỉnh sửa sách';
                this.loadBookData(bookId);
            } else {
                title.textContent = 'Thêm sách mới';
                const form = document.getElementById('book-form');
                if (form) form.reset();
                const bookIdInput = document.getElementById('book-id');
                if (bookIdInput) bookIdInput.value = '';
            }
            
            modal.style.display = 'block';
        }
    }

    closeBookModal() {
        const modal = document.getElementById('book-modal');
        if (modal) modal.style.display = 'none';
    }

    showCategoryModal(categoryId = null) {
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        
        if (modal && title) {
            if (categoryId) {
                title.textContent = 'Chỉnh sửa danh mục';
                this.loadCategoryData(categoryId);
            } else {
                title.textContent = 'Thêm danh mục mới';
                const form = document.getElementById('category-form');
                if (form) form.reset();
                const categoryIdInput = document.getElementById('category-id');
                if (categoryIdInput) categoryIdInput.value = '';
            }
            
            modal.style.display = 'block';
        }
    }

    closeCategoryModal() {
        const modal = document.getElementById('category-modal');
        if (modal) modal.style.display = 'none';
    }

    showPromotionModal(promotionId = null) {
        const modal = document.getElementById('promotion-modal');
        const title = document.getElementById('promotion-modal-title');
        
        if (modal && title) {
            if (promotionId) {
                title.textContent = 'Chỉnh sửa khuyến mãi';
                this.loadPromotionData(promotionId);
            } else {
                title.textContent = 'Thêm khuyến mãi mới';
                const form = document.getElementById('promotion-form');
                if (form) form.reset();
                const promotionIdInput = document.getElementById('promotion-id');
                if (promotionIdInput) promotionIdInput.value = '';
            }
            
            modal.style.display = 'block';
        }
    }

    closePromotionModal() {
        const modal = document.getElementById('promotion-modal');
        if (modal) modal.style.display = 'none';
    }

    // Form handlers
    async handleBookSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('book-id')?.value || '',
            title: document.getElementById('book-title')?.value || '',
            author: document.getElementById('book-author')?.value || '',
            price: parseFloat(document.getElementById('book-price')?.value || 0),
            original_price: parseFloat(document.getElementById('book-original-price')?.value) || null,
            category_id: parseInt(document.getElementById('book-category')?.value || 0),
            stock_quantity: parseInt(document.getElementById('book-stock')?.value || 0),
            description: document.getElementById('book-description')?.value || '',
            image_url: document.getElementById('book-image')?.value || ''
        };

        try {
            if (formData.id) {
                await this.updateBook(formData);
            } else {
                await this.createBook(formData);
            }
            
            this.closeBookModal();
            this.loadBooks();
            this.showSuccess('Lưu sách thành công!');
        } catch (error) {
            this.showError('Lỗi khi lưu sách: ' + error.message);
        }
    }

    async handleCategorySubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('category-id')?.value || '',
            name: document.getElementById('category-name')?.value || '',
            description: document.getElementById('category-description')?.value || '',
            image_url: document.getElementById('category-image')?.value || ''
        };

        try {
            if (formData.id) {
                await this.updateCategory(formData);
            } else {
                await this.createCategory(formData);
            }
            
            this.closeCategoryModal();
            this.loadCategories();
            this.showSuccess('Lưu danh mục thành công!');
        } catch (error) {
            this.showError('Lỗi khi lưu danh mục: ' + error.message);
        }
    }

    async handlePromotionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('promotion-id')?.value || '',
            name: document.getElementById('promotion-name')?.value || '',
            code: document.getElementById('promotion-code')?.value || '',
            discount_type: document.getElementById('promotion-type')?.value || 'percentage',
            discount_value: parseFloat(document.getElementById('promotion-value')?.value || 0),
            usage_limit: document.getElementById('promotion-limit')?.value ? 
                         parseInt(document.getElementById('promotion-limit').value) : null,
            start_date: document.getElementById('promotion-start')?.value || '',
            end_date: document.getElementById('promotion-end')?.value || ''
        };

        try {
            if (formData.id) {
                await this.updatePromotion(formData);
            } else {
                await this.createPromotion(formData);
            }
            
            this.closePromotionModal();
            this.loadPromotions();
            this.showSuccess('Lưu khuyến mãi thành công!');
        } catch (error) {
            this.showError('Lỗi khi lưu khuyến mãi: ' + error.message);
        }
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return 'N/A';
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Chờ xử lý',
            'confirmed': 'Đã xác nhận',
            'shipped': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }

    getContactStatusText(status) {
        const statusMap = {
            'pending': 'Chưa đọc',
            'read': 'Đã đọc',
            'replied': 'Đã trả lời',
            'resolved': 'Đã giải quyết'
        };
        return statusMap[status] || status;
    }

    getSupportStatusText(status) {
        const statusMap = {
            'open': 'Mới',
            'in_progress': 'Đang xử lý',
            'resolved': 'Đã giải quyết',
            'closed': 'Đã đóng'
        };
        return statusMap[status] || status;
    }

    getApplicationStatusText(status) {
        const statusMap = {
            'pending': 'Chờ duyệt',
            'reviewed': 'Đã xem',
            'interview': 'Phỏng vấn',
            'rejected': 'Từ chối',
            'accepted': 'Chấp nhận'
        };
        return statusMap[status] || status;
    }

    getPriorityText(priority) {
        const priorityMap = {
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao',
            'urgent': 'Khẩn cấp'
        };
        return priorityMap[priority] || priority;
    }

    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: message
        });
    }

    // API methods (simulated - replace with actual API calls)
    // Updated API methods using real AdminAPI
    async getBooks() {
        try {
            const response = await AdminAPI.getBooks();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            this.showError('Không thể tải danh sách sách');
            return [];
        }
    }

    async getCategories() {
        try {
            const response = await AdminAPI.getCategories();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            this.showError('Không thể tải danh mục');
            return [];
        }
    }

    async getUsers() {
        try {
            const response = await AdminAPI.getUsers();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            this.showError('Không thể tải danh sách người dùng');
            return [];
        }
    }

    async getOrders(status = '') {
        try {
            const response = await AdminAPI.getOrders(status);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            this.showError('Không thể tải danh sách đơn hàng');
            return [];
        }
    }

    async getPromotions() {
        try {
            const response = await AdminAPI.getPromotions();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
            this.showError('Không thể tải danh sách khuyến mãi');
            return [];
        }
    }

    async getContacts() {
        try {
            const response = await AdminAPI.getContacts();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            this.showError('Không thể tải danh sách liên hệ');
            return [];
        }
    }

    async getSupportTickets() {
        try {
            const response = await AdminAPI.getSupportTickets();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            this.showError('Không thể tải danh sách yêu cầu hỗ trợ');
            return [];
        }
    }

    async getJobApplications() {
        try {
            const response = await AdminAPI.getJobApplications();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching job applications:', error);
            this.showError('Không thể tải danh sách ứng tuyển');
            return [];
        }
    }

    async getRecentOrders() {
        try {
            const response = await AdminAPI.getRecentOrders();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            this.showError('Không thể tải đơn hàng gần đây');
            return [];
        }
    }

    // Additional methods for other functionalities
    async getDashboardStats() {
        try {
            const response = await AdminAPI.getDashboardStats();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            this.showError('Không thể tải thống kê dashboard');
            return null;
        }
    }

    async getRevenueData(timeRange = 'monthly') {
        try {
            const response = await AdminAPI.getRevenueData(timeRange);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            this.showError('Không thể tải dữ liệu doanh thu');
            return [];
        }
    }

    // CRUD operations
    async createBook(bookData) {
        console.log('Creating book:', bookData);
        return { success: true };
    }

    async updateBook(bookData) {
        console.log('Updating book:', bookData);
        return { success: true };
    }

    async deleteBook(bookId) {
        if (confirm('Bạn có chắc muốn xóa sách này?')) {
            console.log('Deleting book:', bookId);
            this.showSuccess('Xóa sách thành công!');
            this.loadBooks();
        }
    }

    async createCategory(categoryData) {
        console.log('Creating category:', categoryData);
        return { success: true };
    }

    async updateCategory(categoryData) {
        console.log('Updating category:', categoryData);
        return { success: true };
    }

    async deleteCategory(categoryId) {
        if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
            console.log('Deleting category:', categoryId);
            this.showSuccess('Xóa danh mục thành công!');
            this.loadCategories();
        }
    }

    async createPromotion(promotionData) {
        console.log('Creating promotion:', promotionData);
        return { success: true };
    }

    async updatePromotion(promotionData) {
        console.log('Updating promotion:', promotionData);
        return { success: true };
    }

    async deletePromotion(promotionId) {
        if (confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
            console.log('Deleting promotion:', promotionId);
            this.showSuccess('Xóa khuyến mãi thành công!');
            this.loadPromotions();
        }
    }

    // Data loading for modals
    async loadBookData(bookId) {
        const book = { 
            id: bookId, 
            title: 'Sample Book', 
            author: 'Sample Author', 
            price: 100000, 
            original_price: 120000,
            category_id: 1,
            stock_quantity: 50,
            description: 'Sample description',
            image_url: '/images/sample.jpg'
        };
        
        this.setFormValue('book-id', book.id);
        this.setFormValue('book-title', book.title);
        this.setFormValue('book-author', book.author);
        this.setFormValue('book-price', book.price);
        this.setFormValue('book-original-price', book.original_price);
        this.setFormValue('book-category', book.category_id);
        this.setFormValue('book-stock', book.stock_quantity);
        this.setFormValue('book-description', book.description);
        this.setFormValue('book-image', book.image_url);
    }

    async loadCategoryData(categoryId) {
        const category = {
            id: categoryId,
            name: 'Sample Category',
            description: 'Sample description',
            image_url: '/images/category.jpg'
        };
        
        this.setFormValue('category-id', category.id);
        this.setFormValue('category-name', category.name);
        this.setFormValue('category-description', category.description);
        this.setFormValue('category-image', category.image_url);
    }

    async loadPromotionData(promotionId) {
        const promotion = {
            id: promotionId,
            name: 'Sample Promotion',
            code: 'SAMPLE10',
            discount_type: 'percentage',
            discount_value: 10,
            usage_limit: 100,
            start_date: '2024-01-01T00:00',
            end_date: '2024-12-31T23:59'
        };
        
        this.setFormValue('promotion-id', promotion.id);
        this.setFormValue('promotion-name', promotion.name);
        this.setFormValue('promotion-code', promotion.code);
        this.setFormValue('promotion-type', promotion.discount_type);
        this.setFormValue('promotion-value', promotion.discount_value);
        this.setFormValue('promotion-limit', promotion.usage_limit);
        this.setFormValue('promotion-start', promotion.start_date);
        this.setFormValue('promotion-end', promotion.end_date);
    }

    setFormValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value || '';
        }
    }

    // Edit methods
    editBook(bookId) {
        this.showBookModal(bookId);
    }

    editCategory(categoryId) {
        this.showCategoryModal(categoryId);
    }

    editPromotion(promotionId) {
        this.showPromotionModal(promotionId);
    }

    // Logout method
    logout() {
        if (window.adminAuth) {
            window.adminAuth.logout();
        }
    }

    // Placeholder methods for future implementation
    deleteUser(userId) {
        if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
            console.log('Deleting user:', userId);
            this.showSuccess('Xóa người dùng thành công!');
            this.loadUsers();
        }
    }

    viewOrder(orderId) {
        console.log('Viewing order:', orderId);
        this.showInfo('Tính năng xem chi tiết đơn hàng đang được phát triển');
    }

    updateOrderStatus(orderId, status) {
        console.log('Updating order status:', orderId, status);
        this.showSuccess('Cập nhật trạng thái đơn hàng thành công!');
        this.loadOrders();
    }

    viewContact(contactId) {
        console.log('Viewing contact:', contactId);
        this.showInfo('Tính năng xem chi tiết liên hệ đang được phát triển');
    }

    updateContactStatus(contactId, status) {
        console.log('Updating contact status:', contactId, status);
        this.showSuccess('Cập nhật trạng thái liên hệ thành công!');
        this.loadContacts();
    }

    viewSupportTicket(ticketId) {
        console.log('Viewing support ticket:', ticketId);
        this.showInfo('Tính năng xem chi tiết hỗ trợ đang được phát triển');
    }

    updateSupportStatus(ticketId, status) {
        console.log('Updating support status:', ticketId, status);
        this.showSuccess('Cập nhật trạng thái hỗ trợ thành công!');
        this.loadSupportTickets();
    }

    viewApplication(applicationId) {
        console.log('Viewing application:', applicationId);
        this.showInfo('Tính năng xem chi tiết ứng tuyển đang được phát triển');
    }

    updateApplicationStatus(applicationId, status) {
        console.log('Updating application status:', applicationId, status);
        this.showSuccess('Cập nhật trạng thái ứng tuyển thành công!');
        this.loadJobApplications();
    }

    showInfo(message) {
        Swal.fire({
            icon: 'info',
            title: 'Thông tin',
            text: message
        });
    }
}

// Initialize admin app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        window.admin = new AdminApp();
        
        // Add logout functionality
        const logoutBtn = document.querySelector('[onclick*="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.admin) {
                    window.admin.logout();
                }
            });
        }
    }
});

// Global functions for modal buttons
function showBookModal() {
    if (window.admin) window.admin.showBookModal();
}

function closeBookModal() {
    if (window.admin) window.admin.closeBookModal();
}

function showCategoryModal() {
    if (window.admin) window.admin.showCategoryModal();
}

function closeCategoryModal() {
    if (window.admin) window.admin.closeCategoryModal();
}

function showPromotionModal() {
    if (window.admin) window.admin.showPromotionModal();
}

function closePromotionModal() {
    if (window.admin) window.admin.closePromotionModal();
}

function loadOrders() {
    if (window.admin) window.admin.loadOrders();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}