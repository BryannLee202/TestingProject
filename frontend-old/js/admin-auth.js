// Admin Authentication
class AdminAuth {
    constructor() {
        this.init();
    }

    init() {
        this.checkExistingAuth();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('admin-email');
        const password = document.getElementById('admin-password');
        
        if (!email || !password) {
            this.showError('Không tìm thấy form đăng nhập');
            return;
        }

        const formData = {
            email: email.value,
            password: password.value
        };

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
        submitBtn.disabled = true;

        try {
            const result = await this.authenticateAdmin(formData);
            
            if (result.success) {
                this.saveAuthData(result.token, result.user);
                this.showSuccess('Đăng nhập thành công!');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                this.showError(result.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            this.showError('Lỗi kết nối: ' + error.message);
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async authenticateAdmin(credentials) {
        // Simulate API call - replace with actual authentication endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check against hardcoded admin credentials (for demo)
                // In production, this should call your backend API
                const validCredentials = [
                    { email: 'admin@bookstore.com', password: 'admin123' },
                    { email: 'admin@email.com', password: '123456' }
                ];

                const isValid = validCredentials.some(
                    cred => cred.email === credentials.email && cred.password === credentials.password
                );

                if (isValid) {
                    resolve({
                        success: true,
                        token: 'demo_admin_token_' + Date.now(),
                        user: {
                            id: 1,
                            name: 'Quản trị viên',
                            email: credentials.email,
                            role: 'admin'
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Email hoặc mật khẩu không đúng'
                    });
                }
            }, 1500);
        });
    }

    saveAuthData(token, user) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        localStorage.setItem('admin_login_time', new Date().toISOString());
    }

    checkExistingAuth() {
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        const currentPath = window.location.pathname;
        
        // If already on admin page and authenticated, do nothing
        if (currentPath.includes('admin.html') && token && user) {
            return true;
        }
        
        // If on admin page but not authenticated, redirect to login
        if (currentPath.includes('admin.html') && (!token || !user)) {
            window.location.href = 'admin-login.html';
            return false;
        }
        
        // If on login page but already authenticated, redirect to admin
        if (currentPath.includes('admin-login.html') && token && user) {
            window.location.href = 'admin.html';
            return true;
        }
        
        return !!token;
    }

    getAuthToken() {
        return localStorage.getItem('admin_token');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('admin_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated() {
        const token = this.getAuthToken();
        const user = this.getCurrentUser();
        
        if (!token || !user) {
            return false;
        }

        // Check if token is expired (optional - depends on your backend)
        const loginTime = localStorage.getItem('admin_login_time');
        if (loginTime) {
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            // Auto logout after 8 hours
            if (hoursDiff > 8) {
                this.logout();
                return false;
            }
        }

        return true;
    }

    logout() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_login_time');
        
        this.showSuccess('Đã đăng xuất thành công!');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1000);
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            this.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 2000);
            return false;
        }
        return true;
    }

    showSuccess(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: message,
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            alert('Thành công: ' + message);
        }
    }

    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: message
            });
        } else {
            alert('Lỗi: ' + message);
        }
    }

    // Utility method to validate email format
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Utility method to validate password strength
    validatePassword(password) {
        return password.length >= 6;
    }
}

// Initialize admin auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminAuth = new AdminAuth();
    
    // Add input validation for login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        const emailInput = document.getElementById('admin-email');
        const passwordInput = document.getElementById('admin-password');
        
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value && !window.adminAuth.validateEmail(this.value)) {
                    this.style.borderColor = '#e74c3c';
                    this.nextElementSibling.style.display = 'block';
                } else {
                    this.style.borderColor = '';
                    this.nextElementSibling.style.display = 'none';
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', function() {
                if (this.value && !window.adminAuth.validatePassword(this.value)) {
                    this.style.borderColor = '#e74c3c';
                } else {
                    this.style.borderColor = '';
                }
            });
        }
    }
});

// Add CSS for validation errors
const style = document.createElement('style');
style.textContent = `
    .input-error {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        display: none;
    }
    
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
`;
document.head.appendChild(style);