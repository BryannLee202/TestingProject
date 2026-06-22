package com.bookstore.service;

import com.bookstore.entity.SiteSetting;
import com.bookstore.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteSettingService {
    private final SiteSettingRepository repository;

    public List<SiteSetting> getAllSettings() {
        return repository.findAll();
    }

    public Map<String, String> getSettingsAsMap() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(SiteSetting::getSettingKey, SiteSetting::getSettingValue));
    }

    public SiteSetting getSetting(String key) {
        return repository.findById(key).orElse(null);
    }

    public SiteSetting saveSetting(String key, String value) {
        SiteSetting setting = repository.findById(key).orElse(new SiteSetting());
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        return repository.save(setting);
    }

    public void saveAllSettings(Map<String, String> settings) {
        List<SiteSetting> entities = settings.entrySet().stream().map(entry -> {
            SiteSetting setting = repository.findById(entry.getKey()).orElse(new SiteSetting());
            setting.setSettingKey(entry.getKey());
            setting.setSettingValue(entry.getValue());
            return setting;
        }).collect(Collectors.toList());
        repository.saveAll(entities);
    }
}
