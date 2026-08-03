package com.bookstore.service;

import com.bookstore.entity.NewsletterSubscriber;
import com.bookstore.repository.NewsletterSubscriberRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit test cho NewsletterService.
 *
 * Phạm vi kiểm thử:
 *  - Kiểm tra tính hợp lệ của địa chỉ email khi đăng ký
 *  - Chuẩn hoá email (cắt khoảng trắng, chuyển chữ thường)
 *  - Xử lý email đã đăng ký: đang hoạt động thì báo lỗi, đã huỷ thì kích hoạt lại
 *  - Gửi email chào mừng và khả năng chịu lỗi khi máy chủ mail gặp sự cố
 *  - Gửi bản tin hàng loạt (bất đồng bộ), chỉ gửi cho người còn đăng ký
 *  - Quản lý danh sách người đăng ký
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NewsletterService - Unit Test")
class NewsletterServiceTest {

    @Mock
    private NewsletterSubscriberRepository repository;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private NewsletterService newsletterService;

    /** Tạo một người đăng ký với trạng thái cho trước. */
    private NewsletterSubscriber taoNguoiDangKy(String email, boolean dangHoatDong) {
        NewsletterSubscriber sub = new NewsletterSubscriber();
        sub.setEmail(email);
        sub.setActive(dangHoatDong);
        return sub;
    }

    // ==================== KIỂM TRA EMAIL HỢP LỆ ====================
    @Nested
    @DisplayName("Kiểm tra email hợp lệ")
    class EmailHopLeTests {

        @Test
        @DisplayName("Ném lỗi khi email là null")
        void subscribe_emailNull_nemLoi() {
            assertThatThrownBy(() -> newsletterService.subscribe(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email không hợp lệ.");

            verifyNoInteractions(repository, mailSender);
        }

        @Test
        @DisplayName("Ném lỗi khi email là chuỗi rỗng")
        void subscribe_emailRong_nemLoi() {
            assertThatThrownBy(() -> newsletterService.subscribe(""))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email không hợp lệ.");
        }

        @Test
        @DisplayName("Ném lỗi khi email chỉ chứa khoảng trắng")
        void subscribe_emailToanKhoangTrang_nemLoi() {
            assertThatThrownBy(() -> newsletterService.subscribe("     "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email không hợp lệ.");
        }

        @Test
        @DisplayName("Ném lỗi khi email thiếu ký tự @")
        void subscribe_emailThieuKyTuA_nemLoi() {
            assertThatThrownBy(() -> newsletterService.subscribe("khongcokytua.com"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email không hợp lệ.");

            verifyNoInteractions(repository);
        }

        @Test
        @DisplayName("Chuỗi chỉ có ký tự @ vẫn được chấp nhận, cho thấy kiểm tra còn lỏng lẻo")
        void subscribe_chiCoKyTuA_vanChapNhan() {
            when(repository.findByEmail("@")).thenReturn(Optional.empty());

            newsletterService.subscribe("@");

            // Chốt lại hành vi hiện tại: điều kiện contains("@") quá đơn giản,
            // không đủ để xác thực một địa chỉ email thật
            verify(repository).save(any(NewsletterSubscriber.class));
        }
    }

    // ==================== ĐĂNG KÝ MỚI ====================
    @Nested
    @DisplayName("Đăng ký mới")
    class DangKyMoiTests {

        @Test
        @DisplayName("Đăng ký email mới thành công và lưu vào cơ sở dữ liệu")
        void subscribe_emailMoi_luuThanhCong() {
            when(repository.findByEmail("a@example.com")).thenReturn(Optional.empty());

            newsletterService.subscribe("a@example.com");

            ArgumentCaptor<NewsletterSubscriber> captor =
                    ArgumentCaptor.forClass(NewsletterSubscriber.class);
            verify(repository).save(captor.capture());

            assertThat(captor.getValue().getEmail()).isEqualTo("a@example.com");
        }

        @Test
        @DisplayName("Email được chuẩn hoá: cắt khoảng trắng và chuyển về chữ thường")
        void subscribe_chuanHoaEmail() {
            when(repository.findByEmail("a@example.com")).thenReturn(Optional.empty());

            newsletterService.subscribe("   A@Example.COM   ");

            ArgumentCaptor<NewsletterSubscriber> captor =
                    ArgumentCaptor.forClass(NewsletterSubscriber.class);
            verify(repository).save(captor.capture());

            assertThat(captor.getValue().getEmail()).isEqualTo("a@example.com");
        }

        @Test
        @DisplayName("Gửi email chào mừng cho người đăng ký mới")
        void subscribe_emailMoi_guiEmailChaoMung() {
            when(repository.findByEmail("a@example.com")).thenReturn(Optional.empty());

            newsletterService.subscribe("a@example.com");

            ArgumentCaptor<SimpleMailMessage> captor =
                    ArgumentCaptor.forClass(SimpleMailMessage.class);
            verify(mailSender).send(captor.capture());
            SimpleMailMessage mail = captor.getValue();

            assertThat(mail.getTo()).containsExactly("a@example.com");
            assertThat(mail.getSubject()).contains("YiYi Book");
            assertThat(mail.getText()).contains("Cảm ơn bạn");
        }

        @Test
        @DisplayName("Máy chủ mail lỗi vẫn giữ nguyên bản ghi đăng ký, không ném lỗi ra ngoài")
        void subscribe_mailLoi_vanLuuDangKy() {
            when(repository.findByEmail("a@example.com")).thenReturn(Optional.empty());
            doThrow(new MailSendException("Máy chủ mail không phản hồi"))
                    .when(mailSender).send(any(SimpleMailMessage.class));

            newsletterService.subscribe("a@example.com");

            verify(repository).save(any(NewsletterSubscriber.class));
        }
    }

    // ==================== ĐĂNG KÝ TRÙNG ====================
    @Nested
    @DisplayName("Xử lý email đã tồn tại")
    class DangKyTrungTests {

        @Test
        @DisplayName("Ném lỗi khi email đang trong danh sách nhận bản tin")
        void subscribe_emailDangHoatDong_nemLoi() {
            NewsletterSubscriber sub = taoNguoiDangKy("a@example.com", true);
            when(repository.findByEmail("a@example.com")).thenReturn(Optional.of(sub));

            assertThatThrownBy(() -> newsletterService.subscribe("a@example.com"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Email này đã được đăng ký từ trước.");

            verify(repository, never()).save(any(NewsletterSubscriber.class));
            verifyNoInteractions(mailSender);
        }

        @Test
        @DisplayName("Email đã huỷ đăng ký trước đó thì được kích hoạt lại")
        void subscribe_emailDaHuy_kichHoatLai() {
            NewsletterSubscriber sub = taoNguoiDangKy("a@example.com", false);
            when(repository.findByEmail("a@example.com")).thenReturn(Optional.of(sub));

            newsletterService.subscribe("a@example.com");

            assertThat(sub.isActive()).isTrue();
            verify(repository).save(sub);
        }

        @Test
        @DisplayName("Kích hoạt lại không gửi email chào mừng")
        void subscribe_kichHoatLai_khongGuiEmailChaoMung() {
            NewsletterSubscriber sub = taoNguoiDangKy("a@example.com", false);
            when(repository.findByEmail("a@example.com")).thenReturn(Optional.of(sub));

            newsletterService.subscribe("a@example.com");

            verifyNoInteractions(mailSender);
        }
    }

    // ==================== GỬI BẢN TIN HÀNG LOẠT ====================
    @Nested
    @DisplayName("sendBulkNewsletter()")
    class GuiHangLoatTests {

        @Test
        @DisplayName("Chỉ gửi bản tin cho người còn trong danh sách nhận")
        void sendBulk_chiGuiChoNguoiConDangKy() {
            NewsletterSubscriber dangHoatDong = taoNguoiDangKy("a@example.com", true);
            NewsletterSubscriber daHuy = taoNguoiDangKy("b@example.com", false);
            when(repository.findAll()).thenReturn(Arrays.asList(dangHoatDong, daHuy));

            newsletterService.sendBulkNewsletter("Sách mới tháng 8", "Nội dung bản tin");

            ArgumentCaptor<SimpleMailMessage> captor =
                    ArgumentCaptor.forClass(SimpleMailMessage.class);
            // Chờ tối đa 2 giây vì tác vụ chạy bất đồng bộ
            verify(mailSender, timeout(2000)).send(captor.capture());

            assertThat(captor.getValue().getTo()).containsExactly("a@example.com");
            assertThat(captor.getValue().getSubject()).isEqualTo("Sách mới tháng 8");
        }

        @Test
        @DisplayName("Gửi tới nhiều người đăng ký cùng lúc")
        void sendBulk_guiChoNhieuNguoi() {
            when(repository.findAll()).thenReturn(Arrays.asList(
                    taoNguoiDangKy("a@example.com", true),
                    taoNguoiDangKy("b@example.com", true),
                    taoNguoiDangKy("c@example.com", true)));

            newsletterService.sendBulkNewsletter("Tiêu đề", "Nội dung");

            verify(mailSender, timeout(2000).times(3)).send(any(SimpleMailMessage.class));
        }

        @Test
        @DisplayName("Lỗi gửi tới một người không làm dừng việc gửi cho những người còn lại")
        void sendBulk_motNguoiLoi_vanGuiTiep() {
            when(repository.findAll()).thenReturn(Arrays.asList(
                    taoNguoiDangKy("a@example.com", true),
                    taoNguoiDangKy("b@example.com", true)));
            doThrow(new MailSendException("Địa chỉ không tồn tại"))
                    .doNothing()
                    .when(mailSender).send(any(SimpleMailMessage.class));

            newsletterService.sendBulkNewsletter("Tiêu đề", "Nội dung");

            verify(mailSender, timeout(2000).times(2)).send(any(SimpleMailMessage.class));
        }

        @Test
        @DisplayName("Danh sách rỗng thì không gửi email nào")
        void sendBulk_danhSachRong_khongGui() {
            when(repository.findAll()).thenReturn(List.of());

            newsletterService.sendBulkNewsletter("Tiêu đề", "Nội dung");

            verify(mailSender, after(500).never()).send(any(SimpleMailMessage.class));
        }
    }

    // ==================== QUẢN LÝ DANH SÁCH ====================
    @Nested
    @DisplayName("Quản lý danh sách đăng ký")
    class QuanLyDanhSachTests {

        @Test
        @DisplayName("Lấy toàn bộ danh sách người đăng ký")
        void getAllSubscribers_traVeToanBo() {
            NewsletterSubscriber sub1 = taoNguoiDangKy("a@example.com", true);
            NewsletterSubscriber sub2 = taoNguoiDangKy("b@example.com", false);
            when(repository.findAll()).thenReturn(Arrays.asList(sub1, sub2));

            assertThat(newsletterService.getAllSubscribers()).containsExactly(sub1, sub2);
        }

        @Test
        @DisplayName("Xoá người đăng ký khi bản ghi tồn tại")
        void deleteSubscriber_tonTai_xoaThanhCong() {
            when(repository.existsById(1L)).thenReturn(true);

            newsletterService.deleteSubscriber(1L);

            verify(repository).deleteById(1L);
        }

        @Test
        @DisplayName("Ném lỗi khi xoá bản ghi không tồn tại")
        void deleteSubscriber_khongTonTai_nemLoi() {
            when(repository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> newsletterService.deleteSubscriber(99L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Không tìm thấy email đăng ký này.");

            verify(repository, never()).deleteById(anyLong());
        }
    }
}