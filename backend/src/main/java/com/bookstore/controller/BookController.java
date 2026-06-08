package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Hỗ trợ gọi API từ Frontend (React)
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.createBook(book));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(bookService.getBooksByCategoryId(categoryId));
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<List<Book>> getBestsellers() {
        return ResponseEntity.ok(bookService.getBestsellers());
    }

    @GetMapping("/combos")
    public ResponseEntity<List<Book>> getCombos() {
        return ResponseEntity.ok(bookService.getCombos());
    }

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<Book>> getRecommendations(@PathVariable String userId) {
        return ResponseEntity.ok(bookService.getRecommendations(userId));
    }
}
