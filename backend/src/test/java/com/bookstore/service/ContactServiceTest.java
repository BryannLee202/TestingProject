package com.bookstore.service;

import com.bookstore.entity.Contact;
import com.bookstore.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit test cho ContactService.
 *
 * Phạm vi kiểm thử:
 *  - Kiểm tra bắt buộc nhập họ tên, email, nội dung góp ý
 *  - Chuẩn hoá dữ liệu trước khi lưu (cắt khoảng trắng, email chuyển chữ thường)
 *  - Cập nhật trạng thái xử lý góp ý
 *  - Xoá góp ý
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ContactService - Unit Test")
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    private Contact contact;

    @BeforeEach
    void setUp() {
        contact = new Contact();
        contact.setFullName("Nguyen Van A");
        contact.setEmail("a@example.com");
        contact.setContent("Tôi muốn góp ý về dịch vụ giao hàng");
        contact.setPhone("0900000000");
    }

    /** Cho contactRepository.save() trả lại chính đối tượng được truyền vào. */
    private void gaLapSaveContact() {
        when(contactRepository.save(any(Contact.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ==================== KIỂM TRA DỮ LIỆU BẮT BUỘC ====================
    @Nested
    @DisplayName("Kiểm tra dữ liệu bắt buộc")
    class DuLieuBatBuocTests {

        @Test
        @DisplayName("Ném lỗi khi họ tên là null")
        void createContact_hoTenNull_nemLoi() {
            contact.setFullName(null);

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Họ tên không được để trống.");

            verifyNoInteractions(contactRepository);
        }

        @Test
        @DisplayName("Ném lỗi khi họ tên chỉ chứa khoảng trắng")
        void createContact_hoTenToanKhoangTrang_nemLoi() {
            contact.setFullName("     ");

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Họ tên không được để trống.");
        }

        @Test
        @DisplayName("Ném lỗi khi email là null")
        void createContact_emailNull_nemLoi() {
            contact.setEmail(null);

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email không hợp lệ.");
        }

        @Test
        @DisplayName("Ném lỗi khi email thiếu ký tự @")
        void createContact_emailThieuKyTuA_nemLoi() {
            contact.setEmail("khongcokytua.com");

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email không hợp lệ.");

            verifyNoInteractions(contactRepository);
        }

        @Test
        @DisplayName("Ném lỗi khi email chỉ chứa khoảng trắng")
        void createContact_emailToanKhoangTrang_nemLoi() {
            contact.setEmail("     ");

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Email không hợp lệ.");
        }

        @Test
        @DisplayName("Ném lỗi khi nội dung góp ý là null")
        void createContact_noiDungNull_nemLoi() {
            contact.setContent(null);

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Nội dung góp ý không được để trống.");
        }

        @Test
        @DisplayName("Ném lỗi khi nội dung góp ý chỉ chứa khoảng trắng")
        void createContact_noiDungToanKhoangTrang_nemLoi() {
            contact.setContent("   ");

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Nội dung góp ý không được để trống.");
        }

        @Test
        @DisplayName("Kiểm tra theo đúng thứ tự: họ tên trước, rồi email, rồi nội dung")
        void createContact_nhieuTruongSai_baoLoiTruongDauTien() {
            contact.setFullName(null);
            contact.setEmail(null);
            contact.setContent(null);

            assertThatThrownBy(() -> contactService.createContact(contact))
                    .hasMessage("Họ tên không được để trống.");
        }
    }

    // ==================== CHUẨN HOÁ DỮ LIỆU ====================
    @Nested
    @DisplayName("Chuẩn hoá dữ liệu trước khi lưu")
    class ChuanHoaTests {

        @Test
        @DisplayName("Gửi góp ý hợp lệ được lưu thành công")
        void createContact_hopLe_luuThanhCong() {
            gaLapSaveContact();

            Contact ketQua = contactService.createContact(contact);

            assertThat(ketQua).isNotNull();
            verify(contactRepository).save(contact);
        }

        @Test
        @DisplayName("Cắt bỏ khoảng trắng thừa ở họ tên và nội dung")
        void createContact_catKhoangTrangThua() {
            contact.setFullName("   Nguyen Van A   ");
            contact.setContent("   Nội dung góp ý   ");
            gaLapSaveContact();

            Contact ketQua = contactService.createContact(contact);

            assertThat(ketQua.getFullName()).isEqualTo("Nguyen Van A");
            assertThat(ketQua.getContent()).isEqualTo("Nội dung góp ý");
        }

        @Test
        @DisplayName("Email được chuyển về chữ thường và cắt khoảng trắng")
        void createContact_chuanHoaEmail() {
            contact.setEmail("   A@Example.COM   ");
            gaLapSaveContact();

            Contact ketQua = contactService.createContact(contact);

            assertThat(ketQua.getEmail()).isEqualTo("a@example.com");
        }

        @Test
        @DisplayName("Số điện thoại được cắt khoảng trắng khi có nhập")
        void createContact_catKhoangTrangSoDienThoai() {
            contact.setPhone("   0900000000   ");
            gaLapSaveContact();

            Contact ketQua = contactService.createContact(contact);

            assertThat(ketQua.getPhone()).isEqualTo("0900000000");
        }

        @Test
        @DisplayName("Không nhập số điện thoại vẫn gửi được góp ý")
        void createContact_khongCoSoDienThoai_vanLuuDuoc() {
            contact.setPhone(null);
            gaLapSaveContact();

            Contact ketQua = contactService.createContact(contact);

            assertThat(ketQua.getPhone()).isNull();
            verify(contactRepository).save(contact);
        }
    }

    // ==================== CẬP NHẬT TRẠNG THÁI ====================
    @Nested
    @DisplayName("updateContactStatus()")
    class CapNhatTrangThaiTests {

        @Test
        @DisplayName("Cập nhật trạng thái xử lý góp ý thành công")
        void updateStatus_thanhCong() {
            when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
            when(contactRepository.save(contact)).thenReturn(contact);

            Contact ketQua = contactService.updateContactStatus(1L, "RESOLVED");

            assertThat(ketQua.getStatus()).isEqualTo("RESOLVED");
            verify(contactRepository).save(contact);
        }

        @Test
        @DisplayName("Ném lỗi kèm ID khi không tìm thấy góp ý")
        void updateStatus_khongTonTai_nemLoi() {
            when(contactRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> contactService.updateContactStatus(99L, "RESOLVED"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Không tìm thấy góp ý với ID: 99");

            verify(contactRepository, never()).save(any(Contact.class));
        }

        @Test
        @DisplayName("Chấp nhận mọi chuỗi trạng thái, kể cả giá trị không nằm trong quy định")
        void updateStatus_trangThaiTuyY_vanChapNhan() {
            when(contactRepository.findById(1L)).thenReturn(Optional.of(contact));
            when(contactRepository.save(contact)).thenReturn(contact);

            Contact ketQua = contactService.updateContactStatus(1L, "TRANG_THAI_KHONG_TON_TAI");

            // Chốt lại hành vi hiện tại: không có ràng buộc nào về tập giá trị hợp lệ
            assertThat(ketQua.getStatus()).isEqualTo("TRANG_THAI_KHONG_TON_TAI");
        }
    }

    // ==================== TRUY VẤN & XOÁ ====================
    @Nested
    @DisplayName("Truy vấn và xoá góp ý")
    class TruyVanXoaTests {

        @Test
        @DisplayName("Lấy toàn bộ góp ý sắp xếp theo thời gian gửi mới nhất")
        void getAllContacts_traVeToanBo() {
            Contact contact2 = new Contact();
            contact2.setFullName("Tran Van B");
            when(contactRepository.findAllByOrderByCreatedAtDesc())
                    .thenReturn(Arrays.asList(contact, contact2));

            List<Contact> ketQua = contactService.getAllContacts();

            assertThat(ketQua).containsExactly(contact, contact2);
        }

        @Test
        @DisplayName("Danh sách rỗng khi chưa có góp ý nào")
        void getAllContacts_danhSachRong() {
            when(contactRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

            assertThat(contactService.getAllContacts()).isEmpty();
        }

        @Test
        @DisplayName("Xoá góp ý khi bản ghi tồn tại")
        void deleteContact_tonTai_xoaThanhCong() {
            when(contactRepository.existsById(1L)).thenReturn(true);

            contactService.deleteContact(1L);

            verify(contactRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Ném lỗi kèm ID khi xoá góp ý không tồn tại")
        void deleteContact_khongTonTai_nemLoi() {
            when(contactRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> contactService.deleteContact(99L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Không tìm thấy góp ý với ID: 99");

            verify(contactRepository, never()).deleteById(anyLong());
        }
    }
}