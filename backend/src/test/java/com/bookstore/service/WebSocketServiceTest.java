package com.bookstore.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit test cho WebSocketService.
 *
 * Lớp này chỉ có một phương thức uỷ quyền trực tiếp cho SimpMessagingTemplate,
 * không chứa nhánh điều kiện hay phép biến đổi dữ liệu nào. Kiểm thử đơn vị
 * ở đây chỉ xác nhận đúng kênh đích và đúng nội dung được gửi đi.
 *
 * Hành vi thực sự của WebSocket (kết nối, đăng ký kênh, nhận tin phía client)
 * chỉ có thể kiểm chứng bằng kiểm thử tích hợp với WebSocketStompClient.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("WebSocketService - Unit Test")
class WebSocketServiceTest {

    private static final String KENH_CAP_NHAT = "/topic/updates";

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private WebSocketService webSocketService;

    @Test
    @DisplayName("Gửi tín hiệu thay đổi dữ liệu sách tới đúng kênh cập nhật")
    void broadcastDataChange_loaiSach_guiDungKenh() {
        webSocketService.broadcastDataChange("BOOK");

        verify(messagingTemplate).convertAndSend(KENH_CAP_NHAT, "BOOK");
    }

    @Test
    @DisplayName("Gửi tín hiệu thay đổi dữ liệu đơn hàng tới đúng kênh cập nhật")
    void broadcastDataChange_loaiDonHang_guiDungKenh() {
        webSocketService.broadcastDataChange("ORDER");

        verify(messagingTemplate).convertAndSend(KENH_CAP_NHAT, "ORDER");
    }

    @Test
    @DisplayName("Gửi nhiều tín hiệu liên tiếp đều tới cùng một kênh")
    void broadcastDataChange_nhieuLan_deuGuiDungKenh() {
        webSocketService.broadcastDataChange("BOOK");
        webSocketService.broadcastDataChange("ORDER");
        webSocketService.broadcastDataChange("CATEGORY");

        verify(messagingTemplate).convertAndSend(KENH_CAP_NHAT, "BOOK");
        verify(messagingTemplate).convertAndSend(KENH_CAP_NHAT, "ORDER");
        verify(messagingTemplate).convertAndSend(KENH_CAP_NHAT, "CATEGORY");
        verifyNoMoreInteractions(messagingTemplate);
    }

    @Test
    @DisplayName("Loại dữ liệu null vẫn được gửi đi, không có kiểm tra đầu vào")
    void broadcastDataChange_loaiNull_vanGui() {
        webSocketService.broadcastDataChange(null);

        // Chốt lại hành vi hiện tại: service không kiểm tra tham số đầu vào
        verify(messagingTemplate).convertAndSend(KENH_CAP_NHAT, (Object) null);
    }

    @Test
    @DisplayName("Lỗi từ tầng gửi tin được ném thẳng ra ngoài, không được bắt lại")
    void broadcastDataChange_loiGuiTin_nemRaNgoai() {
        doThrow(new MessagingException("Kênh không khả dụng"))
                .when(messagingTemplate).convertAndSend(KENH_CAP_NHAT, (Object) "BOOK");

        // Chốt lại hành vi hiện tại: nghiệp vụ gọi tới sẽ bị gián đoạn
        // nếu WebSocket gặp sự cố, dù đây chỉ là tính năng phụ trợ
        assertThatThrownBy(() -> webSocketService.broadcastDataChange("BOOK"))
                .isInstanceOf(MessagingException.class);
    }
}