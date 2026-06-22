package com.bookstore.controller;

import com.bookstore.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SiteSettingController {
    private final SiteSettingService siteSettingService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(siteSettingService.getSettingsAsMap());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, String> settings) {
        siteSettingService.saveAllSettings(settings);
        return ResponseEntity.ok(Map.of("success", true, "message", "Lưu cấu hình thành công"));
    }
}
