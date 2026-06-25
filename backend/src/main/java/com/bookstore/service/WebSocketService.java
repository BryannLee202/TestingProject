package com.bookstore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Gửi tín hiệu báo cho tất cả clients biết có thay đổi dữ liệu
     * @param entityType Loại dữ liệu (ví dụ: "BOOK", "ORDER", "CATEGORY")
     */
    public void broadcastDataChange(String entityType) {
        // Gửi một chuỗi đơn giản tới /topic/updates
        messagingTemplate.convertAndSend("/topic/updates", entityType);
    }
}
