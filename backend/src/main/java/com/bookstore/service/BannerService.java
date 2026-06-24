package com.bookstore.service;

import com.bookstore.entity.Banner;
import com.bookstore.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BannerService {

    private final BannerRepository bannerRepository;

    @org.springframework.cache.annotation.Cacheable("banners")
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    @org.springframework.cache.annotation.Cacheable(value = "banners", key = "#position")
    public List<Banner> getBannersByPosition(String position) {
        return bannerRepository.findByPosition(position);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "banners", allEntries = true)
    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "banners", allEntries = true)
    public Banner updateBanner(Long id, Banner updatedBanner) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner!"));
        banner.setImageUrl(updatedBanner.getImageUrl());
        banner.setTitle(updatedBanner.getTitle());
        banner.setLinkUrl(updatedBanner.getLinkUrl());
        banner.setPosition(updatedBanner.getPosition());
        return bannerRepository.save(banner);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "banners", allEntries = true)
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}
