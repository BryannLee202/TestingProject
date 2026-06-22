package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "site_settings")
@Data
public class SiteSetting {
    @Id
    @Column(name = "setting_key", length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "NVARCHAR(MAX)")
    private String settingValue;
}
