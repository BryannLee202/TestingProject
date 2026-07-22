package com.bookstore.controller;

import com.bookstore.config.VNPayConfig;
import com.bookstore.config.MoMoConfig;
import com.bookstore.config.ZaloPayConfig;
import com.bookstore.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

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

    @org.springframework.beans.factory.annotation.Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

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
        vnp_Params.put("vnp_ReturnUrl", frontendUrl + "/payment-result");
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
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
    public ResponseEntity<?> createMomoUrl(
            @RequestParam("amount") long amount,
            @RequestParam("orderId") String orderIdStr) {
        try {
            String requestId = String.valueOf(System.currentTimeMillis());
            String orderId = orderIdStr + "_" + requestId;
            String orderInfo = "Thanh toan don hang " + orderIdStr;
            String returnUrl = frontendUrl + "/payment-result";
            String notifyUrl = MoMoConfig.NOTIFY_URL;
            String amountStr = String.valueOf(amount);
            String extraData = "";
            String requestType = "payWithATM";

            String rawSignature = "accessKey=" + MoMoConfig.ACCESS_KEY +
                    "&amount=" + amountStr +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + notifyUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + MoMoConfig.PARTNER_CODE +
                    "&redirectUrl=" + returnUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            String signature = MoMoConfig.hmacSHA256(rawSignature, MoMoConfig.SECRET_KEY);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", MoMoConfig.PARTNER_CODE);
            requestBody.put("partnerName", "Test");
            requestBody.put("storeId", "MomoTestStore");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", returnUrl);
            requestBody.put("ipnUrl", notifyUrl);
            requestBody.put("lang", "vi");
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", requestType);
            requestBody.put("signature", signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(MoMoConfig.ENDPOINT, entity, Map.class);
            
            if (response.getBody() != null && response.getBody().get("payUrl") != null) {
                return ResponseEntity.ok(Map.of("url", response.getBody().get("payUrl").toString()));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Error from MoMo: " + response.getBody()));
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "MoMo API Error: " + e.getResponseBodyAsString()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create MoMo URL: " + e.getMessage()));
        }
    }

    @GetMapping("/zalopay/create-url")
    public ResponseEntity<Map<String, String>> createZaloPayUrl(
            @RequestParam("amount") long amount,
            @RequestParam("orderId") String orderId) {
        try {
            java.text.SimpleDateFormat zlpFormatter = new java.text.SimpleDateFormat("yyMMdd");
            zlpFormatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            String appTransId = zlpFormatter.format(new java.util.Date()) + "_" + orderId;
            String appTime = String.valueOf(System.currentTimeMillis());
            String embedData = "{\"redirecturl\": \"" + frontendUrl + "/payment-result\"}";
            String item = "[]";
            
            String macData = ZaloPayConfig.APP_ID + "|" + appTransId + "|user123|" + amount + "|" + appTime + "|" + embedData + "|" + item;
            String mac = ZaloPayConfig.hmacSHA256(macData, ZaloPayConfig.KEY1);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            Map<String, Object> order = new HashMap<>();
            order.put("app_id", Integer.parseInt(ZaloPayConfig.APP_ID));
            order.put("app_trans_id", appTransId);
            order.put("app_user", "user123");
            order.put("app_time", Long.parseLong(appTime));
            order.put("item", item);
            order.put("embed_data", embedData);
            order.put("amount", amount);
            order.put("description", "Thanh toan don hang #" + orderId);
            order.put("bank_code", "");
            order.put("mac", mac);

            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(order, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(ZaloPayConfig.CREATE_ORDER_URL, entity, Map.class);
            
            if (response.getBody() != null && response.getBody().get("return_code").toString().equals("1")) {
                return ResponseEntity.ok(Map.of("url", response.getBody().get("order_url").toString()));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Error from ZaloPay: " + response.getBody()));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create ZaloPay URL: " + e.getMessage()));
        }
    }

    @GetMapping("/zalopay-return")
    public ResponseEntity<?> zalopayReturn(@RequestParam("apptransid") String appTransId) {
        try {
            String[] parts = appTransId.split("_");
            if (parts.length != 2) return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid apptransid"));
            Long orderId = Long.parseLong(parts[1]);

            String macData = ZaloPayConfig.APP_ID + "|" + appTransId + "|" + ZaloPayConfig.KEY1;
            String mac = ZaloPayConfig.hmacSHA256(macData, ZaloPayConfig.KEY1);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            org.springframework.util.MultiValueMap<String, String> map = new org.springframework.util.LinkedMultiValueMap<>();
            map.add("app_id", ZaloPayConfig.APP_ID);
            map.add("app_trans_id", appTransId);
            map.add("mac", mac);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> request = new org.springframework.http.HttpEntity<>(map, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(ZaloPayConfig.QUERY_ORDER_URL, request, Map.class);
            
            if (response.getBody() != null && response.getBody().get("return_code").toString().equals("1")) {
                try {
                    orderService.confirmVNPayPayment(orderId, true);
                } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                    // Ignore concurrent modification exception (already processed by another thread)
                } catch (Exception e) {
                    if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {
                         // Ignore
                    } else {
                         throw e;
                    }
                }
                return ResponseEntity.ok(Map.of("status", "success", "message", "Payment success", "orderId", orderId));
            } else {
                try {
                    orderService.confirmVNPayPayment(orderId, false);
                } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                    // Ignore
                } catch (Exception e) {
                    if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {
                         // Ignore
                    } else {
                         throw e;
                    }
                }
                return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "Payment failed or cancelled"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
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
                if ((fieldValue != null) && (fieldValue.length() > 0) && fieldName.startsWith("vnp_")) {
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
                    try {
                        orderService.confirmVNPayPayment(orderId, true);
                    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {} catch (Exception e) { if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {} else { throw e; } }
                    return ResponseEntity.ok(Map.of("status", "success", "message", "Payment success", "orderId", orderId));
                } else {
                    // Payment failed
                    try {
                        orderService.confirmVNPayPayment(orderId, false);
                    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {} catch (Exception e) { if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {} else { throw e; } }
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
    @GetMapping("/momo-return")
    public ResponseEntity<?> momoReturn(HttpServletRequest request) {
        try {
            String partnerCode = request.getParameter("partnerCode");
            String orderIdStr = request.getParameter("orderId");
            String requestId = request.getParameter("requestId");
            String amount = request.getParameter("amount");
            String orderInfo = request.getParameter("orderInfo");
            String orderType = request.getParameter("orderType");
            String transId = request.getParameter("transId");
            String resultCode = request.getParameter("resultCode");
            String message = request.getParameter("message");
            String payType = request.getParameter("payType");
            String responseTime = request.getParameter("responseTime");
            String extraData = request.getParameter("extraData");
            String signature = request.getParameter("signature");

            String rawSignature = "accessKey=" + MoMoConfig.ACCESS_KEY +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&message=" + message +
                    "&orderId=" + orderIdStr +
                    "&orderInfo=" + orderInfo +
                    "&orderType=" + orderType +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + payType +
                    "&requestId=" + requestId +
                    "&responseTime=" + responseTime +
                    "&resultCode=" + resultCode +
                    "&transId=" + transId;

            String signValue = MoMoConfig.hmacSHA256(rawSignature, MoMoConfig.SECRET_KEY);

            if (signValue.equals(signature)) {
                String realOrderIdStr = orderIdStr.split("_")[0];
                Long orderId = Long.parseLong(realOrderIdStr);

                if ("0".equals(resultCode)) {
                    try {
                        orderService.confirmVNPayPayment(orderId, true);
                    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {} catch (Exception e) { if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {} else { throw e; } }
                    return ResponseEntity.ok(Map.of("status", "success", "message", "Payment success", "orderId", orderId));
                } else {
                    try {
                        orderService.confirmVNPayPayment(orderId, false);
                    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {} catch (Exception e) { if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {} else { throw e; } }
                    return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", message));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invalid signature"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Internal server error"));
        }
    }

    @PostMapping("/momo-ipn")
    public ResponseEntity<?> momoIpn(@RequestBody Map<String, Object> payload) {
        try {
            String partnerCode = (String) payload.get("partnerCode");
            String orderIdStr = (String) payload.get("orderId");
            String requestId = (String) payload.get("requestId");
            String amount = String.valueOf(payload.get("amount"));
            String orderInfo = (String) payload.get("orderInfo");
            String orderType = (String) payload.get("orderType");
            String transId = String.valueOf(payload.get("transId"));
            String resultCode = String.valueOf(payload.get("resultCode"));
            String message = (String) payload.get("message");
            String payType = (String) payload.get("payType");
            String responseTime = String.valueOf(payload.get("responseTime"));
            String extraData = (String) payload.get("extraData");
            String signature = (String) payload.get("signature");

            String rawSignature = "accessKey=" + MoMoConfig.ACCESS_KEY +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&message=" + message +
                    "&orderId=" + orderIdStr +
                    "&orderInfo=" + orderInfo +
                    "&orderType=" + orderType +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + payType +
                    "&requestId=" + requestId +
                    "&responseTime=" + responseTime +
                    "&resultCode=" + resultCode +
                    "&transId=" + transId;

            String signValue = MoMoConfig.hmacSHA256(rawSignature, MoMoConfig.SECRET_KEY);

            if (signValue.equals(signature)) {
                String realOrderIdStr = orderIdStr.split("_")[0];
                Long orderId = Long.parseLong(realOrderIdStr);

                if ("0".equals(resultCode)) {
                    try {
                        orderService.confirmVNPayPayment(orderId, true);
                    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {} catch (Exception e) { if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {} else { throw e; } }
                } else {
                    try {
                        orderService.confirmVNPayPayment(orderId, false);
                    } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {} catch (Exception e) { if (e.getCause() != null && e.getCause() instanceof org.hibernate.StaleObjectStateException) {} else { throw e; } }
                }
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
