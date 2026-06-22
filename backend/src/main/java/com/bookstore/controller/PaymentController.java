package com.bookstore.controller;

import com.bookstore.config.VNPayConfig;
import com.bookstore.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final OrderService orderService;

    @GetMapping("/create-url")
    public ResponseEntity<Map<String, String>> createPaymentUrl(
            @RequestParam("amount") long amount,
            @RequestParam("orderId") String orderId,
            @RequestParam(value = "bankCode", required = false) String bankCode,
            HttpServletRequest request) {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amountVND = amount * 100;

        String vnp_TxnRef = orderId + "_" + System.currentTimeMillis();
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);

        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amountVND));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + orderId);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        try {
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = (String) itr.next();
                String fieldValue = (String) vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;

            return ResponseEntity.ok(Map.of("url", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating payment url"));
        }
    }

    @GetMapping("/momo/create-url")
    public ResponseEntity<Map<String, String>> createMomoUrl(
            @RequestParam("amount") long amount,
            @RequestParam("orderId") String orderId) {
        // MoMo requires registered Sandbox PartnerCode & keys. We will use a mock URL for demonstration.
        String mockUrl = "http://localhost:5173/payment/mock-gateway?method=MOMO&orderId=" + orderId + "&amount=" + amount;
        return ResponseEntity.ok(Map.of("url", mockUrl));
    }

    @GetMapping("/zalopay/create-url")
    public ResponseEntity<Map<String, String>> createZaloPayUrl(
            @RequestParam("amount") long amount,
            @RequestParam("orderId") String orderId) {
        // ZaloPay requires registered AppID & keys. We will use a mock URL for demonstration.
        String mockUrl = "http://localhost:5173/payment/mock-gateway?method=ZALOPAY&orderId=" + orderId + "&amount=" + amount;
        return ResponseEntity.ok(Map.of("url", mockUrl));
    }

    @PostMapping("/mock-return")
    public ResponseEntity<?> mockReturn(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.parseLong(payload.get("orderId").toString());
            boolean success = (boolean) payload.get("success");
            orderService.confirmVNPayPayment(orderId, success);
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error"));
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) {
        try {
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType")) {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash")) {
                fields.remove("vnp_SecureHash");
            }

            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = (String) itr.next();
                String fieldValue = (String) fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String signValue = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
            if (signValue.equals(vnp_SecureHash)) {
                String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
                String vnp_TxnRef = request.getParameter("vnp_TxnRef");
                String orderIdStr = vnp_TxnRef.split("_")[0];
                Long orderId = Long.parseLong(orderIdStr);

                if ("00".equals(vnp_ResponseCode)) {
                    // Payment success
                    orderService.confirmVNPayPayment(orderId, true);
                    return ResponseEntity.ok(Map.of("status", "success", "message", "Payment success", "orderId", orderId));
                } else {
                    // Payment failed
                    orderService.confirmVNPayPayment(orderId, false);
                    return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "Payment failed or cancelled"));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid signature"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Internal server error"));
        }
    }
}
