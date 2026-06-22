package com.bookstore.controller;

import com.bookstore.entity.Book;
import com.bookstore.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.bookstore.utils.ExcelHelper;

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
    public ResponseEntity<List<Book>> getRecommendations(
            @PathVariable String userId,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(bookService.getRecommendations(userId, categoryId));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<Book>> getLatestBooks() {
        return ResponseEntity.ok(bookService.getLatestBooks());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Book>> getFeaturedBooks() {
        return ResponseEntity.ok(bookService.getFeaturedBooks());
    }

    @PutMapping("/{id}/featured")
    public ResponseEntity<Book> toggleFeaturedStatus(@PathVariable Long id, @RequestBody java.util.Map<String, Boolean> payload) {
        boolean isFeatured = payload.getOrDefault("isFeatured", false);
        return ResponseEntity.ok(bookService.toggleFeaturedStatus(id, isFeatured));
    }

    @GetMapping("/discounted")
    public ResponseEntity<List<Book>> getDiscountedBooks() {
        return ResponseEntity.ok(bookService.getDiscountedBooks());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        return ResponseEntity.ok(bookService.updateBook(id, book));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String keyword) {
        return ResponseEntity.ok(bookService.searchBooks(keyword));
    }

    @GetMapping("/import/template")
    public ResponseEntity<Resource> getImportTemplate() {
        InputStreamResource file = new InputStreamResource(ExcelHelper.generateBooksTemplate());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=books_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(file);
    }

    @PostMapping("/import")
    public ResponseEntity<?> importBooks(@RequestParam("file") MultipartFile file) {
        if (ExcelHelper.hasExcelFormat(file)) {
            try {
                bookService.importBooksFromExcel(file);
                return ResponseEntity.ok().body("{\"message\": \"Tải tệp thành công và đã lưu dữ liệu\"}");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body("{\"message\": \"Lỗi: " + e.getMessage() + "\"}");
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Vui lòng upload tệp Excel (.xlsx)\"}");
    }
}
