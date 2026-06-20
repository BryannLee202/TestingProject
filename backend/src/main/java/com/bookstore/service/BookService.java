package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách với ID: " + id));
    }

    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    public List<Book> getBooksByCategoryId(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public List<Book> getBestsellers() {
        return bookRepository.findTop10ByOrderBySalesCountDesc();
    }

    public List<Book> getCombos() {
        return bookRepository.findByIsComboTrue();
    }

    public List<Book> getRecommendations(String userId) {
        // Tạm thời trả về bestsellers cho recommendations
        return getBestsellers();
    }

    public List<Book> getLatestBooks() {
        return bookRepository.findTop10ByOrderByIdDesc();
    }

    public List<Book> getDiscountedBooks() {
        return bookRepository.findByDiscountGreaterThanOrderByDiscountDesc(0);
    }

    public Book updateBook(Long id, Book updatedBook) {
        Book book = getBookById(id);
        book.setTitle(updatedBook.getTitle());
        book.setAuthor(updatedBook.getAuthor());
        book.setPublisher(updatedBook.getPublisher());
        book.setDescription(updatedBook.getDescription());
        book.setPrice(updatedBook.getPrice());
        book.setOldPrice(updatedBook.getOldPrice());
        book.setDiscount(updatedBook.getDiscount());
        book.setStockQuantity(updatedBook.getStockQuantity());
        book.setImageUrl(updatedBook.getImageUrl());
        book.setIsCombo(updatedBook.getIsCombo());
        book.setCategory(updatedBook.getCategory());
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public List<Book> searchBooks(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        String cleanKeyword = keyword.trim().toLowerCase();
        
        // Loại bỏ các từ khóa thừa
        if (cleanKeyword.startsWith("sách ")) {
            cleanKeyword = cleanKeyword.substring(5).trim();
        } else if (cleanKeyword.startsWith("truyện ")) {
            cleanKeyword = cleanKeyword.substring(7).trim();
        } else if (cleanKeyword.startsWith("cuốn ")) {
            cleanKeyword = cleanKeyword.substring(5).trim();
        } else if (cleanKeyword.startsWith("tiểu thuyết ")) {
            cleanKeyword = cleanKeyword.substring(12).trim();
        }
        
        if (cleanKeyword.isEmpty()) {
            cleanKeyword = keyword.trim().toLowerCase();
        }

        return bookRepository.searchBooksByKeyword(cleanKeyword);
    }
}
