package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.repository.BookRepository;
import com.bookstore.utils.ExcelHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

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
        if (bookRepository.findFirstByTitle(book.getTitle().trim()).isPresent()) {
            throw new RuntimeException("Sách với tiêu đề '" + book.getTitle() + "' đã tồn tại trong hệ thống.");
        }
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
        book.setAdditionalImages(updatedBook.getAdditionalImages());
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

    public void importBooksFromExcel(MultipartFile file) {
        try {
            List<Book> books = ExcelHelper.excelToBooks(file.getInputStream());
            for (Book newBook : books) {
                if (newBook.getTitle() == null || newBook.getTitle().trim().isEmpty()) {
                    continue; // Bỏ qua sách không có tên
                }
                
                java.util.Optional<Book> existingOpt = bookRepository.findFirstByTitle(newBook.getTitle().trim());
                if (existingOpt.isPresent()) {
                    Book existing = existingOpt.get();
                    if (newBook.getAuthor() != null && !newBook.getAuthor().isEmpty()) existing.setAuthor(newBook.getAuthor());
                    if (newBook.getPublisher() != null && !newBook.getPublisher().isEmpty()) existing.setPublisher(newBook.getPublisher());
                    if (newBook.getDescription() != null && !newBook.getDescription().isEmpty()) existing.setDescription(newBook.getDescription());
                    if (newBook.getPrice() != null && newBook.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) existing.setPrice(newBook.getPrice());
                    if (newBook.getOldPrice() != null) existing.setOldPrice(newBook.getOldPrice());
                    if (newBook.getDiscount() != null) existing.setDiscount(newBook.getDiscount());
                    if (newBook.getStockQuantity() != null) existing.setStockQuantity(newBook.getStockQuantity());
                    if (newBook.getCategory() != null && newBook.getCategory().getId() != null && newBook.getCategory().getId() != 0) existing.setCategory(newBook.getCategory());
                    if (newBook.getImageUrl() != null && !newBook.getImageUrl().isEmpty()) existing.setImageUrl(newBook.getImageUrl());
                    bookRepository.save(existing);
                } else {
                    bookRepository.save(newBook);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi import file: " + e.getMessage());
        }
    }
}
