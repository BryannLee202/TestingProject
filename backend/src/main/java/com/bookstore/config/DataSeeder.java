package com.bookstore.config;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final BannerRepository bannerRepository;
    private final NotificationRepository notificationRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed User
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .email("admin@gmail.com")
                    .fullName("Quản trị viên")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User user = User.builder()
                    .username("user@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .email("user@gmail.com")
                    .fullName("Khách hàng")
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
        }

        // 2. Seed Banners
        if (bannerRepository.count() == 0) {
            bannerRepository.saveAll(List.of(
                Banner.builder()
                        .imageUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80")
                        .title("Manga Hot Tháng 06")
                        .linkUrl("/category/1")
                        .position("MAIN")
                        .build(),
                Banner.builder()
                        .imageUrl("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80")
                        .title("Sách Ngoại Văn Ưu Đãi")
                        .linkUrl("/category/2")
                        .position("MAIN")
                        .build(),
                Banner.builder()
                        .imageUrl("https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&auto=format&fit=crop&q=80")
                        .title("Đồ Chơi Trẻ Em")
                        .linkUrl("/category/3")
                        .position("MAIN")
                        .build(),
                Banner.builder()
                        .imageUrl("https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80")
                        .title("Deal Hời Mỗi Ngày")
                        .linkUrl("/")
                        .position("SIDE")
                        .build(),
                Banner.builder()
                        .imageUrl("https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600&auto=format&fit=crop&q=80")
                        .title("Thanh Toán VNPAY")
                        .linkUrl("/")
                        .position("SIDE")
                        .build()
            ));
        }

        // Seed Notifications
        if (notificationRepository.count() == 0) {
            notificationRepository.saveAll(List.of(
                Notification.builder()
                        .title("Khuyến mãi 50% văn học")
                        .content("Nhập mã GRAPE50 để giảm ngay 50% tối đa 50k cho tất cả đầu sách thuộc danh mục Tiểu Thuyết.")
                        .type("PROMO")
                        .createdAt(LocalDateTime.now())
                        .build(),
                Notification.builder()
                        .title("Chào mừng đến với Grape Book")
                        .content("Chúc bạn có những trải nghiệm mua sắm sách tuyệt vời nhất tại nhà sách trực tuyến Grape Book của chúng tôi!")
                        .type("SYSTEM")
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build(),
                Notification.builder()
                        .title("Chào hè rực rỡ")
                        .content("Bộ sưu tập truyện tranh Manga đồng giá chỉ từ 15k duy nhất tuần này. Xem ngay!")
                        .type("PROMO")
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build()
            ));
        }
 
        // 3. Seed Coupons
        if (couponRepository.count() == 0) {
            couponRepository.saveAll(List.of(
                Coupon.builder()
                        .code("GRAPE10")
                        .discountType(DiscountType.PERCENTAGE)
                        .discountValue(10.0)
                        .minOrderAmount(100000.0)
                        .expirationDate(LocalDateTime.now().plusMonths(3))
                        .isActive(true)
                        .build(),
                Coupon.builder()
                        .code("SALE50K")
                        .discountType(DiscountType.FIXED)
                        .discountValue(50000.0)
                        .minOrderAmount(300000.0)
                        .expirationDate(LocalDateTime.now().plusMonths(3))
                        .isActive(true)
                        .build(),
                Coupon.builder()
                        .code("FREESHIP")
                        .discountType(DiscountType.FIXED)
                        .discountValue(30000.0)
                        .minOrderAmount(150000.0)
                        .expirationDate(LocalDateTime.now().plusMonths(3))
                        .isActive(true)
                        .build()
            ));
        }

        // 4. Seed Categories & Books
        List<Category> allCats = categoryRepository.findAll();
        Category thieuNhi = getOrCreateCategory(allCats, "Sách Thiếu Nhi", "Các tác phẩm dành cho trẻ em",
                "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&auto=format&fit=crop&q=80");
        Category tieuThuyet = getOrCreateCategory(allCats, "Tiểu Thuyết", "Tiểu thuyết tình cảm, lãng mạn, trinh thám",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80");
        Category khoaHoc = getOrCreateCategory(allCats, "Khoa Học Công Nghệ", "Sách về lập trình, vật lý, vũ trụ",
                "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400&auto=format&fit=crop&q=80");
        Category combo = getOrCreateCategory(allCats, "Combo Sách", "Combo tiết kiệm",
                "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&auto=format&fit=crop&q=80");
        Category vanPhongPham = getOrCreateCategory(allCats, "Văn phòng phẩm", "Bút, vở, dụng cụ học tập",
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&auto=format&fit=crop&q=80");
        Category doChoi = getOrCreateCategory(allCats, "Đồ chơi", "Đồ chơi trí tuệ, mô hình",
                "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&auto=format&fit=crop&q=80");
        Category mangaComic = getOrCreateCategory(allCats, "Manga-Comic", "Truyện tranh Nhật Bản, Mỹ",
                "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80");
        Category sachNgoaiVan = getOrCreateCategory(allCats, "Sách ngoại văn", "Sách nhập khẩu bằng tiếng Anh, Nhật",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80");
        Category quaLuNiem = getOrCreateCategory(allCats, "Quà lưu niệm", "Quà tặng xinh xắn độc đáo",
                "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&auto=format&fit=crop&q=80");
        Category bachHoa = getOrCreateCategory(allCats, "Bách hóa", "Đồ dùng tiện ích nhỏ gọn",
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80");

        List<Book> allBooks = bookRepository.findAll();
        
        saveBookIfNotExist(allBooks, Book.builder()
                .title("Dế Mèn Phiêu Lưu Ký")
                .author("Tô Hoài")
                .description("Tác phẩm thiếu nhi kinh điển của văn học Việt Nam.")
                .price(BigDecimal.valueOf(55000.0))
                .oldPrice(BigDecimal.valueOf(80000.0))
                .discount(31)
                .stockQuantity(100)
                .imageUrl("https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(thieuNhi)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Clean Code")
                .author("Robert C. Martin")
                .description("Sách hay nhất về kỹ năng viết code sạch và bảo trì code.")
                .price(BigDecimal.valueOf(250000.0))
                .oldPrice(BigDecimal.valueOf(300000.0))
                .discount(16)
                .stockQuantity(50)
                .imageUrl("https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg")
                .salesCount(0)
                .isCombo(false)
                .category(khoaHoc)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Nhà Giả Kim")
                .author("Paulo Coelho")
                .description("Cuốn sách bán chạy thứ hai thế giới, chỉ sau kinh thánh.")
                .price(BigDecimal.valueOf(79000.0))
                .oldPrice(BigDecimal.valueOf(110000.0))
                .discount(28)
                .stockQuantity(200)
                .imageUrl("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(tieuThuyet)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Combo Harry Potter (7 Tập)")
                .author("J.K. Rowling")
                .description("Trọn bộ 7 tập truyện phép thuật Harry Potter nổi tiếng.")
                .price(BigDecimal.valueOf(1500000.0))
                .oldPrice(BigDecimal.valueOf(1800000.0))
                .discount(16)
                .stockQuantity(20)
                .imageUrl("https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(true)
                .category(combo)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Bút Bi Thiên Long FO-03")
                .author("Thiên Long")
                .description("Bút bi viết trơn, đều màu mực, thích hợp cho học sinh và văn phòng.")
                .price(BigDecimal.valueOf(5000.0))
                .oldPrice(BigDecimal.valueOf(6000.0))
                .discount(16)
                .stockQuantity(1000)
                .imageUrl("https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(vanPhongPham)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Đồ chơi Lego City Cảnh sát tuần tra")
                .author("Lego")
                .description("Bộ xếp hình Lego giúp kích thích trí thông minh cho trẻ em.")
                .price(BigDecimal.valueOf(320000.0))
                .oldPrice(BigDecimal.valueOf(450000.0))
                .discount(28)
                .stockQuantity(30)
                .imageUrl("https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(doChoi)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Doraemon Truyện Ngắn - Tập 1")
                .author("Fujiko F. Fujio")
                .description("Tập đầu tiên của bộ truyện ngắn Doraemon chú mèo máy thông minh.")
                .price(BigDecimal.valueOf(25000.0))
                .oldPrice(BigDecimal.valueOf(30000.0))
                .discount(16)
                .stockQuantity(300)
                .imageUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(mangaComic)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Harry Potter and the Philosopher's Stone")
                .author("J.K. Rowling")
                .description("English version of the famous magic fantasy novel Harry Potter.")
                .price(BigDecimal.valueOf(220000.0))
                .oldPrice(BigDecimal.valueOf(280000.0))
                .discount(21)
                .stockQuantity(80)
                .imageUrl("https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(sachNgoaiVan)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Móc Khóa Gỗ Anime Chibi")
                .author("Đang Cập Nhật")
                .description("Móc khóa gỗ khắc chibi siêu dễ thương làm quà tặng.")
                .price(BigDecimal.valueOf(18000.0))
                .oldPrice(BigDecimal.valueOf(25000.0))
                .discount(28)
                .stockQuantity(150)
                .imageUrl("https://images.unsplash.com/photo-1560859251-d563a49c5e4a?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(quaLuNiem)
                .build());

        saveBookIfNotExist(allBooks, Book.builder()
                .title("Bình Nước Thủy Tinh Có Bao Silicon 450ml")
                .author("Lock&Lock")
                .description("Bình nước thủy tinh chịu nhiệt có bao ngoài bằng silicon chống va đập.")
                .price(BigDecimal.valueOf(95000.0))
                .oldPrice(BigDecimal.valueOf(130000.0))
                .discount(26)
                .stockQuantity(60)
                .imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80")
                .salesCount(0)
                .isCombo(false)
                .category(bachHoa)
                .build());
    }

    private Category getOrCreateCategory(List<Category> list, String name, String description, String imageUrl) {
        return list.stream()
                .filter(c -> c.getName().equals(name))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(new Category(null, name, description, imageUrl, false, null)));
    }

    private void saveBookIfNotExist(List<Book> list, Book book) {
        Book existing = list.stream().filter(b -> b.getTitle().equalsIgnoreCase(book.getTitle())).findFirst().orElse(null);
        if (existing == null) {
            bookRepository.save(book);
        }
    }
}
