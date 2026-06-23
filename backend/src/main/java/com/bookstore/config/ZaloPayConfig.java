package com.bookstore.config;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class ZaloPayConfig {
    public static final String APP_ID = "2553";
    public static final String KEY1 = "***REMOVED_ZALOPAY_KEY1***";
    public static final String KEY2 = "kLtgPl8YESD1XcgX5IQOZIbdzVmWVPNI";
    public static final String CREATE_ORDER_URL = "https://sb-openapi.zalopay.vn/v2/create";
    public static final String QUERY_ORDER_URL = "https://sb-openapi.zalopay.vn/v2/query";
    
    public static String hmacSHA256(String data, String secretKey) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate hmac-sha256", e);
        }
    }
}
