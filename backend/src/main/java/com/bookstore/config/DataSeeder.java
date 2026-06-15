package com.bookstore.config;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed User
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("123456"))
                    .email("admin@bookstore.com")
                    .fullName("Quản trị viên")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User user = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("123456"))
                    .email("user@bookstore.com")
                    .fullName("Khách hàng")
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
        }

        // 2. Seed Categories
        if (categoryRepository.count() == 0) {
            Category thieuNhi = new Category(null, "Sách Thiếu Nhi", "Các tác phẩm dành cho trẻ em", null);
            Category tieuThuyet = new Category(null, "Tiểu Thuyết", "Tiểu thuyết tình cảm, lãng mạn, trinh thám", null);
            Category khoaHoc = new Category(null, "Khoa Học Công Nghệ", "Sách về lập trình, vật lý, vũ trụ", null);
            Category combo = new Category(null, "Combo Sách", "Combo tiết kiệm", null);

            categoryRepository.saveAll(List.of(thieuNhi, tieuThuyet, khoaHoc, combo));

            // 3. Seed Books
            if (bookRepository.count() == 0) {
                Book book1 = Book.builder()
                        .title("Dế Mèn Phiêu Lưu Ký")
                        .author("Tô Hoài")
                        .description("Tác phẩm thiếu nhi kinh điển của văn học Việt Nam.")
                        .price(BigDecimal.valueOf(55000.0))
                        .stockQuantity(100)
                        .imageUrl("https://bizweb.dktcdn.net/100/197/269/products/de-men-phieu-luu-ky-bia-cung.jpg")
                        .salesCount(500)
                        .isCombo(false)
                        .category(thieuNhi)
                        .build();

                Book book2 = Book.builder()
                        .title("Clean Code")
                        .author("Robert C. Martin")
                        .description("Sách hay nhất về kỹ năng viết code sạch và bảo trì code.")
                        .price(BigDecimal.valueOf(250000.0))
                        .stockQuantity(50)
                        .imageUrl("https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg")
                        .salesCount(120)
                        .isCombo(false)
                        .category(khoaHoc)
                        .build();

                Book book3 = Book.builder()
                        .title("Nhà Giả Kim")
                        .author("Paulo Coelho")
                        .description("Cuốn sách bán chạy thứ hai thế giới, chỉ sau kinh thánh.")
                        .price(BigDecimal.valueOf(79000.0))
                        .stockQuantity(200)
                        .imageUrl("https://nhanam.vn/goc-nhin/wp-content/uploads/2021/05/NhaGiaKim-cover.jpg")
                        .salesCount(1500)
                        .isCombo(false)
                        .category(tieuThuyet)
                        .build();

                Book book4 = Book.builder()
                        .title("Combo Harry Potter (7 Tập)")
                        .author("J.K. Rowling")
                        .description("Trọn bộ 7 tập truyện phép thuật Harry Potter nổi tiếng.")
                        .price(BigDecimal.valueOf(1500000.0))
                        .stockQuantity(20)
                        .imageUrl("https://salt.tikicdn.com/cache/w1200/ts/product/bc/50/a1/3807908b89e376046e7f1be701ad8166.jpg")
                        .salesCount(45)
                        .isCombo(true)
                        .category(combo)
                        .build();

                bookRepository.saveAll(List.of(book1, book2, book3, book4));
            }
        }
    }
}
