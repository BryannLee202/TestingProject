package com.bookstore.service;

import com.bookstore.entity.SiteSetting;
import com.bookstore.repository.SiteSettingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

/**
 * Unit test cho SiteSettingService.
 *
 * Phạm vi kiểm thử:
 *  - Lấy toàn bộ cấu hình dưới dạng danh sách và dưới dạng Map
 *  - Lấy một cấu hình theo khoá
 *  - Lưu cấu hình: tạo mới nếu chưa có, ghi đè nếu đã tồn tại
 *  - Lưu hàng loạt nhiều cấu hình cùng lúc
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SiteSettingService - Unit Test")
class SiteSettingServiceTest {

    @Mock
    private SiteSettingRepository repository;

    @InjectMocks
    private SiteSettingService siteSettingService;

    /** Tạo một bản ghi cấu hình. */
    private SiteSetting taoCauHinh(String khoa, String giaTri) {
        SiteSetting setting = new SiteSetting();
        setting.setSettingKey(khoa);
        setting.setSettingValue(giaTri);
        return setting;
    }

    // ==================== TRUY VẤN CẤU HÌNH ====================
    @Nested
    @DisplayName("Truy vấn cấu hình")
    class TruyVanTests {

        @Test
        @DisplayName("Lấy toàn bộ cấu hình dưới dạng danh sách")
        void getAllSettings_traVeToanBo() {
            SiteSetting s1 = taoCauHinh("site_name", "YiYi Book");
            SiteSetting s2 = taoCauHinh("hotline", "1900 1234");
            when(repository.findAll()).thenReturn(Arrays.asList(s1, s2));

            assertThat(siteSettingService.getAllSettings()).containsExactly(s1, s2);
        }

        @Test
        @DisplayName("Chuyển danh sách cấu hình thành Map khoá - giá trị")
        void getSettingsAsMap_chuyenThanhMap() {
            when(repository.findAll()).thenReturn(Arrays.asList(
                    taoCauHinh("site_name", "YiYi Book"),
                    taoCauHinh("hotline", "1900 1234")));

            Map<String, String> ketQua = siteSettingService.getSettingsAsMap();

            assertThat(ketQua)
                    .hasSize(2)
                    .containsEntry("site_name", "YiYi Book")
                    .containsEntry("hotline", "1900 1234");
        }

        @Test
        @DisplayName("Chưa có cấu hình nào thì trả về Map rỗng")
        void getSettingsAsMap_khongCoCauHinh_mapRong() {
            when(repository.findAll()).thenReturn(List.of());

            assertThat(siteSettingService.getSettingsAsMap()).isEmpty();
        }

        @Test
        @DisplayName("Cấu hình có giá trị null làm cả hàm ném NullPointerException")
        void getSettingsAsMap_giaTriNull_nemNullPointerException() {
            when(repository.findAll()).thenReturn(Arrays.asList(
                    taoCauHinh("site_name", "YiYi Book"),
                    taoCauHinh("banner_text", null)));

            // Collectors.toMap không chấp nhận giá trị null.
            // Chỉ một bản ghi lỗi là toàn bộ cấu hình website không tải được.
            assertThatThrownBy(() -> siteSettingService.getSettingsAsMap())
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        @DisplayName("Lấy cấu hình theo khoá khi tồn tại")
        void getSetting_tonTai_traVeCauHinh() {
            SiteSetting setting = taoCauHinh("site_name", "YiYi Book");
            when(repository.findById("site_name")).thenReturn(Optional.of(setting));

            SiteSetting ketQua = siteSettingService.getSetting("site_name");

            assertThat(ketQua).isSameAs(setting);
            assertThat(ketQua.getSettingValue()).isEqualTo("YiYi Book");
        }

        @Test
        @DisplayName("Khoá không tồn tại trả về null thay vì ném lỗi")
        void getSetting_khongTonTai_traVeNull() {
            when(repository.findById("khong_ton_tai")).thenReturn(Optional.empty());

            // Chốt lại hành vi hiện tại: nơi gọi phải tự kiểm tra null,
            // khác với các service khác vốn ném ngoại lệ khi không tìm thấy
            assertThat(siteSettingService.getSetting("khong_ton_tai")).isNull();
        }
    }

    // ==================== LƯU MỘT CẤU HÌNH ====================
    @Nested
    @DisplayName("saveSetting()")
    class LuuCauHinhTests {

        @Test
        @DisplayName("Khoá chưa tồn tại: tạo bản ghi cấu hình mới")
        void saveSetting_khoaMoi_taoMoi() {
            when(repository.findById("hotline")).thenReturn(Optional.empty());
            when(repository.save(any(SiteSetting.class))).thenAnswer(inv -> inv.getArgument(0));

            SiteSetting ketQua = siteSettingService.saveSetting("hotline", "1900 1234");

            assertThat(ketQua.getSettingKey()).isEqualTo("hotline");
            assertThat(ketQua.getSettingValue()).isEqualTo("1900 1234");
        }

        @Test
        @DisplayName("Khoá đã tồn tại: ghi đè giá trị cũ, không tạo bản ghi trùng")
        void saveSetting_khoaDaTonTai_ghiDe() {
            SiteSetting cauHinhCu = taoCauHinh("hotline", "1900 0000");
            when(repository.findById("hotline")).thenReturn(Optional.of(cauHinhCu));
            when(repository.save(cauHinhCu)).thenReturn(cauHinhCu);

            SiteSetting ketQua = siteSettingService.saveSetting("hotline", "1900 1234");

            assertThat(ketQua).isSameAs(cauHinhCu);
            assertThat(ketQua.getSettingValue()).isEqualTo("1900 1234");
            verify(repository).save(cauHinhCu);
        }

        @Test
        @DisplayName("Lưu được giá trị rỗng, không có kiểm tra đầu vào")
        void saveSetting_giaTriRong_vanLuu() {
            when(repository.findById("banner_text")).thenReturn(Optional.empty());
            when(repository.save(any(SiteSetting.class))).thenAnswer(inv -> inv.getArgument(0));

            SiteSetting ketQua = siteSettingService.saveSetting("banner_text", "");

            assertThat(ketQua.getSettingValue()).isEmpty();
        }

        @Test
        @DisplayName("Lưu được giá trị null, tạo ra dữ liệu làm hỏng getSettingsAsMap")
        void saveSetting_giaTriNull_vanLuu() {
            when(repository.findById("banner_text")).thenReturn(Optional.empty());
            when(repository.save(any(SiteSetting.class))).thenAnswer(inv -> inv.getArgument(0));

            SiteSetting ketQua = siteSettingService.saveSetting("banner_text", null);

            // Đây chính là nguồn gốc của lỗi NullPointerException ở getSettingsAsMap
            assertThat(ketQua.getSettingValue()).isNull();
        }
    }

    // ==================== LƯU HÀNG LOẠT ====================
    @Nested
    @DisplayName("saveAllSettings()")
    class LuuHangLoatTests {

        @Test
        @DisplayName("Lưu nhiều cấu hình mới cùng lúc")
        void saveAllSettings_nhieuCauHinhMoi() {
            Map<String, String> cauHinh = new LinkedHashMap<>();
            cauHinh.put("site_name", "YiYi Book");
            cauHinh.put("hotline", "1900 1234");

            when(repository.findById("site_name")).thenReturn(Optional.empty());
            when(repository.findById("hotline")).thenReturn(Optional.empty());

            siteSettingService.saveAllSettings(cauHinh);

            ArgumentCaptor<List<SiteSetting>> captor = ArgumentCaptor.forClass(List.class);
            verify(repository).saveAll(captor.capture());

            assertThat(captor.getValue())
                    .hasSize(2)
                    .extracting(SiteSetting::getSettingKey)
                    .containsExactlyInAnyOrder("site_name", "hotline");
        }

        @Test
        @DisplayName("Cấu hình đã tồn tại được cập nhật thay vì tạo mới")
        void saveAllSettings_capNhatCauHinhCu() {
            SiteSetting cauHinhCu = taoCauHinh("hotline", "1900 0000");
            Map<String, String> cauHinh = Map.of("hotline", "1900 1234");

            when(repository.findById("hotline")).thenReturn(Optional.of(cauHinhCu));

            siteSettingService.saveAllSettings(cauHinh);

            assertThat(cauHinhCu.getSettingValue()).isEqualTo("1900 1234");
            verify(repository).saveAll(anyList());
        }

        @Test
        @DisplayName("Map rỗng vẫn gọi lưu, không ném lỗi")
        void saveAllSettings_mapRong_khongLoi() {
            siteSettingService.saveAllSettings(Map.of());

            ArgumentCaptor<List<SiteSetting>> captor = ArgumentCaptor.forClass(List.class);
            verify(repository).saveAll(captor.capture());

            assertThat(captor.getValue()).isEmpty();
        }

        @Test
        @DisplayName("Mỗi cấu hình phát sinh một truy vấn riêng xuống cơ sở dữ liệu")
        void saveAllSettings_moiCauHinhMotTruyVan() {
            Map<String, String> cauHinh = new LinkedHashMap<>();
            cauHinh.put("site_name", "YiYi Book");
            cauHinh.put("hotline", "1900 1234");
            cauHinh.put("address", "TP.HCM");

            when(repository.findById(any(String.class))).thenReturn(Optional.empty());

            siteSettingService.saveAllSettings(cauHinh);

            // Chốt lại hành vi hiện tại: lưu N cấu hình cần N truy vấn tìm kiếm,
            // nên dùng findAllById một lần thay vì gọi findById trong vòng lặp
            verify(repository, times(3)).findById(any(String.class));
        }
    }
}