package com.bookstore.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${FIREBASE_SERVICE_ACCOUNT_JSON:}")
    private String firebaseServiceAccountJson;

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount = null;

            // Ưu tiên biến môi trường (dùng cho production trên Render)
            if (firebaseServiceAccountJson != null && !firebaseServiceAccountJson.isBlank()) {
                serviceAccount = new ByteArrayInputStream(
                    firebaseServiceAccountJson.getBytes(StandardCharsets.UTF_8)
                );
                System.out.println("Firebase: Dùng service account từ biến môi trường.");
            } else {
                // Fallback: đọc từ file (dùng cho local development)
                serviceAccount = getClass().getClassLoader().getResourceAsStream("serviceAccountKey.json");
                if (serviceAccount != null) {
                    System.out.println("Firebase: Dùng service account từ file serviceAccountKey.json.");
                }
            }

            if (serviceAccount == null) {
                System.err.println("Cảnh báo: Không tìm thấy Firebase credentials. Google Login sẽ không hoạt động!");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Admin SDK đã được khởi tạo thành công!");
            }
        } catch (Exception e) {
            System.err.println("Lỗi khởi tạo Firebase Admin SDK: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
