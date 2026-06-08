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
}
