package com.bookstore.listener;

import com.bookstore.config.SpringContext;
import com.bookstore.service.WebSocketService;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;

public class WebSocketEntityListener {

    @PostPersist
    @PostUpdate
    @PostRemove
    public void onEntityChange(Object entity) {
        try {
            WebSocketService webSocketService = SpringContext.getBean(WebSocketService.class);
            if (webSocketService != null) {
                String entityName = entity.getClass().getSimpleName().toUpperCase();
                webSocketService.broadcastDataChange(entityName);
            }
        } catch (Exception e) {
            // Log if needed, but don't break the transaction
            System.err.println("Failed to broadcast entity change: " + e.getMessage());
        }
    }
}
