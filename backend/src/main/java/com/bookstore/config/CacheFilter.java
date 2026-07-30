package com.bookstore.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class CacheFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        // Chỉ áp dụng cho GET requests public
        if (request.getMethod().equalsIgnoreCase("GET") && (
                requestURI.startsWith("/api/books") ||
                requestURI.startsWith("/api/categories") ||
                requestURI.startsWith("/api/banners") ||
                requestURI.startsWith("/api/settings")
        )) {
            // Cache trên Browser trong 5 phút (300 giây)
            response.setHeader("Cache-Control", "public, max-age=300");
        }

        filterChain.doFilter(request, response);
    }
}
