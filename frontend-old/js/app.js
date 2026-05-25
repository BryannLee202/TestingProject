class BookstoreApp {
  constructor() {
    this.currentPage = 1;
    this.currentCategory = "";
    this.currentSearch = "";
    this.init();
  }

  async init() {
    // Initialize cart count
    Cart.updateCartCount();

    // Load initial data
    await this.loadCategories();
    await this.loadBooks();

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener(
      "input",
      this.debounce(() => {
        this.currentSearch = searchInput.value;
        this.currentPage = 1;
        this.loadBooks();
      }, 500)
    );

    // Category filter
    const categoryFilter = document.getElementById("category-filter");
    categoryFilter.addEventListener("change", () => {
      this.currentCategory = categoryFilter.value;
      this.currentPage = 1;
      this.loadBooks();
    });

    // Load more button
    const loadMoreBtn = document.getElementById("load-more-btn");
    loadMoreBtn.addEventListener("click", () => {
      this.currentPage++;
      this.loadBooks(true);
    });

    // Modal close
    const modal = document.getElementById("book-modal");
    const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async loadCategories() {
    try {
      const response = await BookstoreAPI.getCategories();
      if (response.success) {
        this.renderCategories(response.data);
        this.renderCategoryFilter(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async loadBooks(append = false) {
    try {
      const params = {
        page: this.currentPage,
        limit: 8,
      };

      if (this.currentCategory) {
        params.category_id = this.currentCategory;
      }

      if (this.currentSearch) {
        params.search = this.currentSearch;
      }

      const response = await BookstoreAPI.getBooks(params);

      if (response.success) {
        if (append) {
          this.appendBooks(response.data);
        } else {
          this.renderBooks(response.data);
        }

        // Show/hide load more button
        const loadMoreBtn = document.getElementById("load-more-btn");
        const hasMore = this.currentPage < response.pagination.total;
        loadMoreBtn.style.display = hasMore ? "block" : "none";
      }
    } catch (error) {
      console.error("Error loading books:", error);
    }
  }

  renderCategories(categories) {
    const container = document.getElementById("categories-list");
    container.innerHTML = categories
      .map(
        (category) => `
            <div class="category-card" onclick="app.showBooksByCategory(${category.id})">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <span class="book-count">${category.book_count} sách</span>
            </div>
        `
      )
      .join("");
  }

  renderCategoryFilter(categories) {
    const filter = document.getElementById("category-filter");
    filter.innerHTML = `
            <option value="">Tất cả danh mục</option>
            ${categories
              .map(
                (category) => `
                <option value="${category.id}">${category.name}</option>
            `
              )
              .join("")}
        `;
  }

  renderBooks(books) {
    const container = document.getElementById("books-list");
    container.innerHTML = books
      .map((book) => this.createBookCard(book))
      .join("");
  }

  appendBooks(books) {
    const container = document.getElementById("books-list");
    container.innerHTML += books
      .map((book) => this.createBookCard(book))
      .join("");
  }

  createBookCard(book) {
    return `
            <div class="book-card">
                <div class="book-image">
                    ${
                      book.image_url
                        ? `<img src="${book.image_url}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: cover;">`
                        : '<i class="fas fa-book" style="font-size: 3rem; color: #999;"></i>'
                    }
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <p class="book-author">${book.category_name || ""}</p>
                    <div class="book-price">${this.formatPrice(
                      book.price
                    )}</div>
                    <div class="book-actions">
                        <button class="btn-secondary" onclick="app.showBookDetail(${
                          book.id
                        })">
                            Chi tiết
                        </button>
                        <button class="btn-add-cart" onclick="app.addToCart(${
                          book.id
                        })">
                            Thêm giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  async showBookDetail(bookId) {
    try {
      const response = await BookstoreAPI.getBookById(bookId);
      if (response.success) {
        this.renderBookDetail(response.data);
      }
    } catch (error) {
      console.error("Error loading book detail:", error);
    }
  }

  renderBookDetail(book) {
    const container = document.getElementById("book-detail");
    container.innerHTML = `
            <div class="book-detail">
                <h2>${book.title}</h2>
                <p><strong>Tác giả:</strong> ${book.author}</p>
                <p><strong>Danh mục:</strong> ${
                  book.category_name || "Không có"
                }</p>
                <p><strong>Giá:</strong> ${this.formatPrice(book.price)}</p>
                <p><strong>Mô tả:</strong> ${
                  book.description || "Không có mô tả"
                }</p>
                <p><strong>Số lượng trong kho:</strong> ${
                  book.stock_quantity
                }</p>
                <div style="margin-top: 2rem;">
                    <button class="btn-add-cart" onclick="app.addToCart(${
                      book.id
                    })" style="padding: 1rem 2rem;">
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        `;

    document.getElementById("book-modal").style.display = "block";
  }

  async showBooksByCategory(categoryId) {
    this.currentCategory = categoryId;
    this.currentPage = 1;
    document.getElementById("category-filter").value = categoryId;
    await this.loadBooks();

    // Scroll to books section
    document.getElementById("books").scrollIntoView({ behavior: "smooth" });
  }

  async addToCart(bookId) {
    try {
      const response = await BookstoreAPI.getBookById(bookId);
      if (response.success) {
        Cart.addToCart(response.data);
        this.showNotification("Đã thêm vào giỏ hàng!", "success");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.showNotification("Lỗi khi thêm vào giỏ hàng!", "error");
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === "success" ? "#2c5530" : "#dc3545"};
            color: white;
            border-radius: 5px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Navigation function
function showBooksSection() {
  document.getElementById("books").scrollIntoView({ behavior: "smooth" });
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new BookstoreApp();
});
