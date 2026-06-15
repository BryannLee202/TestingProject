package com.bookstore.service;

import com.bookstore.entity.Banner;
import com.bookstore.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public List<Banner> getBannersByPosition(String position) {
        return bannerRepository.findByPosition(position);
    }

    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner updatedBanner) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner!"));
        banner.setImageUrl(updatedBanner.getImageUrl());
        banner.setTitle(updatedBanner.getTitle());
        banner.setLinkUrl(updatedBanner.getLinkUrl());
        banner.setPosition(updatedBanner.getPosition());
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}
