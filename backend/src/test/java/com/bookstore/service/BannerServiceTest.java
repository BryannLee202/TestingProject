package com.bookstore.service;

import com.bookstore.entity.Banner;
import com.bookstore.repository.BannerRepository;
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
import static org.mockito.Mockito.*;

/**
 * Unit test cho BannerService.
 *
 * Phạm vi kiểm thử:
 *  - Lấy toàn bộ banner và lọc theo vị trí hiển thị
 *  - Tạo, cập nhật, xoá banner
 *
 * Lưu ý: các annotation @Cacheable và @CacheEvict hoạt động thông qua proxy
 * của Spring nên không có hiệu lực trong kiểm thử đơn vị. Hành vi bộ nhớ đệm
 * cần được kiểm chứng bằng kiểm thử tích hợp.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BannerService - Unit Test")
class BannerServiceTest {

    @Mock
    private BannerRepository bannerRepository;

    @InjectMocks
    private BannerService bannerService;

    private Banner banner;

    @BeforeEach
    void setUp() {
        banner = new Banner();
        banner.setTitle("Khuyến mãi tháng 8");
        banner.setImageUrl("https://example.com/banner.jpg");
        banner.setLinkUrl("/khuyen-mai");
        banner.setPosition("HOME_HERO");
    }

    /** Tạo nhanh một banner với vị trí cho trước. */
    private Banner taoBanner(String tieuDe, String viTri) {
        Banner b = new Banner();
        b.setTitle(tieuDe);
        b.setImageUrl("https://example.com/" + tieuDe + ".jpg");
        b.setPosition(viTri);
        return b;
    }

    // ==================== TRUY VẤN BANNER ====================
    @Nested
    @DisplayName("Truy vấn banner")
    class TruyVanTests {

        @Test
        @DisplayName("Lấy toàn bộ banner trong hệ thống")
        void getAllBanners_traVeToanBo() {
            Banner banner2 = taoBanner("Sách mới", "HOME_SIDEBAR");
            when(bannerRepository.findAll()).thenReturn(Arrays.asList(banner, banner2));

            List<Banner> ketQua = bannerService.getAllBanners();

            assertThat(ketQua).containsExactly(banner, banner2);
        }

        @Test
        @DisplayName("Danh sách rỗng khi chưa có banner nào")
        void getAllBanners_danhSachRong() {
            when(bannerRepository.findAll()).thenReturn(List.of());

            assertThat(bannerService.getAllBanners()).isEmpty();
        }

        @Test
        @DisplayName("Lọc banner theo đúng vị trí hiển thị")
        void getBannersByPosition_locDungViTri() {
            when(bannerRepository.findByPosition("HOME_HERO")).thenReturn(List.of(banner));

            List<Banner> ketQua = bannerService.getBannersByPosition("HOME_HERO");

            assertThat(ketQua).containsExactly(banner);
            assertThat(ketQua.get(0).getPosition()).isEqualTo("HOME_HERO");
        }

        @Test
        @DisplayName("Vị trí không có banner nào thì trả về danh sách rỗng")
        void getBannersByPosition_viTriKhongCo_traVeRong() {
            when(bannerRepository.findByPosition("KHONG_TON_TAI")).thenReturn(List.of());

            assertThat(bannerService.getBannersByPosition("KHONG_TON_TAI")).isEmpty();
        }

        @Test
        @DisplayName("Vị trí null được truyền thẳng xuống tầng dữ liệu, không bị chặn")
        void getBannersByPosition_viTriNull_khongChan() {
            when(bannerRepository.findByPosition(null)).thenReturn(List.of());

            // Chốt lại hành vi hiện tại: service không kiểm tra tham số đầu vào
            assertThat(bannerService.getBannersByPosition(null)).isEmpty();
        }
    }

    // ==================== TẠO BANNER ====================
    @Nested
    @DisplayName("createBanner()")
    class TaoBannerTests {

        @Test
        @DisplayName("Tạo banner mới thành công")
        void createBanner_thanhCong() {
            when(bannerRepository.save(banner)).thenReturn(banner);

            Banner ketQua = bannerService.createBanner(banner);

            assertThat(ketQua).isSameAs(banner);
            verify(bannerRepository).save(banner);
        }

        @Test
        @DisplayName("Banner thiếu ảnh và tiêu đề vẫn được lưu, không có kiểm tra đầu vào")
        void createBanner_thieuDuLieu_vanLuu() {
            Banner bannerTrong = new Banner();
            when(bannerRepository.save(bannerTrong)).thenReturn(bannerTrong);

            bannerService.createBanner(bannerTrong);

            // Chốt lại hành vi hiện tại: không có ràng buộc nào về dữ liệu bắt buộc
            verify(bannerRepository).save(bannerTrong);
        }
    }

    // ==================== CẬP NHẬT BANNER ====================
    @Nested
    @DisplayName("updateBanner()")
    class CapNhatBannerTests {

        @Test
        @DisplayName("Cập nhật đầy đủ thông tin banner")
        void updateBanner_capNhatDayDu() {
            Banner duLieuMoi = new Banner();
            duLieuMoi.setTitle("Khuyến mãi tháng 9");
            duLieuMoi.setImageUrl("https://example.com/banner-moi.jpg");
            duLieuMoi.setLinkUrl("/khuyen-mai-thang-9");
            duLieuMoi.setPosition("HOME_SIDEBAR");

            when(bannerRepository.findById(1L)).thenReturn(Optional.of(banner));
            when(bannerRepository.save(banner)).thenReturn(banner);

            Banner ketQua = bannerService.updateBanner(1L, duLieuMoi);

            assertThat(ketQua.getTitle()).isEqualTo("Khuyến mãi tháng 9");
            assertThat(ketQua.getImageUrl()).isEqualTo("https://example.com/banner-moi.jpg");
            assertThat(ketQua.getLinkUrl()).isEqualTo("/khuyen-mai-thang-9");
            assertThat(ketQua.getPosition()).isEqualTo("HOME_SIDEBAR");
        }

        @Test
        @DisplayName("Trường bỏ trống bị ghi đè thành null, làm mất dữ liệu cũ")
        void updateBanner_truongBoTrong_ghiDeThanhNull() {
            Banner duLieuMoi = new Banner();
            duLieuMoi.setTitle("Chỉ đổi tiêu đề");

            when(bannerRepository.findById(1L)).thenReturn(Optional.of(banner));
            when(bannerRepository.save(banner)).thenReturn(banner);

            Banner ketQua = bannerService.updateBanner(1L, duLieuMoi);

            // Chốt lại hành vi hiện tại: chỉ gửi lên tiêu đề thì ảnh, liên kết
            // và vị trí hiển thị đều bị xoá trắng
            assertThat(ketQua.getTitle()).isEqualTo("Chỉ đổi tiêu đề");
            assertThat(ketQua.getImageUrl()).isNull();
            assertThat(ketQua.getLinkUrl()).isNull();
            assertThat(ketQua.getPosition()).isNull();
        }

        @Test
        @DisplayName("Ném lỗi khi cập nhật banner không tồn tại")
        void updateBanner_khongTonTai_nemLoi() {
            when(bannerRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bannerService.updateBanner(99L, new Banner()))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Không tìm thấy banner!");

            verify(bannerRepository, never()).save(any(Banner.class));
        }
    }

    // ==================== XOÁ BANNER ====================
    @Nested
    @DisplayName("deleteBanner()")
    class XoaBannerTests {

        @Test
        @DisplayName("Xoá banner theo mã định danh")
        void deleteBanner_xoaThanhCong() {
            bannerService.deleteBanner(1L);

            verify(bannerRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Xoá banner không tồn tại vẫn gọi xuống tầng dữ liệu, không kiểm tra trước")
        void deleteBanner_khongTonTai_khongKiemTraTruoc() {
            bannerService.deleteBanner(99L);

            // Chốt lại hành vi hiện tại: khác với ContactService và NewsletterService,
            // ở đây không kiểm tra sự tồn tại trước khi xoá
            verify(bannerRepository).deleteById(99L);
            verify(bannerRepository, never()).existsById(any());
        }
    }
}
