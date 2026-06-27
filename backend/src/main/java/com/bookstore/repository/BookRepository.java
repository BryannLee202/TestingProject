package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByCategoryId(Long categoryId);
    
    java.util.Optional<Book> findFirstByTitle(String title);

    List<Book> findTop200ByOrderBySalesCountDesc();

    List<Book> findByIsComboTrue();

    List<Book> findTop200ByOrderByIdDesc();

    List<Book> findByIsFeaturedTrue();

    @Query("SELECT b FROM Book b WHERE b.discount > 0 OR (b.oldPrice IS NOT NULL AND b.oldPrice > b.price) ORDER BY b.discount DESC, b.id DESC")
    List<Book> findDiscountedBooks();

    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);

    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Book> searchBooksByKeyword(@Param("keyword") String keyword);
}
