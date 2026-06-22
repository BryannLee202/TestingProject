package com.bookstore.repository;

import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user AND o.status != 'CANCELLED' AND (o.discountCouponCode = :code OR o.shippingCouponCode = :code)")
    long countUsageByUser(
        @org.springframework.data.repository.query.Param("user") User user, 
        @org.springframework.data.repository.query.Param("code") String code
    );

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o JOIN o.items i WHERE o.user = :user AND i.book = :book AND o.shippingStatus = :shippingStatus")
    boolean hasUserBoughtBookAndDelivered(
        @org.springframework.data.repository.query.Param("user") User user, 
        @org.springframework.data.repository.query.Param("book") com.bookstore.entity.Book book, 
        @org.springframework.data.repository.query.Param("shippingStatus") com.bookstore.entity.ShippingStatus shippingStatus
    );

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(i) FROM Order o JOIN o.items i WHERE o.user = :user AND i.book = :book AND o.shippingStatus = :shippingStatus")
    long countUserDeliveredPurchases(
        @org.springframework.data.repository.query.Param("user") User user, 
        @org.springframework.data.repository.query.Param("book") com.bookstore.entity.Book book, 
        @org.springframework.data.repository.query.Param("shippingStatus") com.bookstore.entity.ShippingStatus shippingStatus
    );
}
