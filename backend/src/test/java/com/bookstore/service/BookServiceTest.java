package com.bookstore.service;

import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;

    private Book testBook;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Văn Học")
                .build();

        testBook = Book.builder()
                .id(100L)
                .title("Clean Code")
                .author("Robert C. Martin")
                .price(new BigDecimal("250000"))
                .isFeatured(false)
                .isCombo(false)
                .category(testCategory)
                .build();
    }

    @Test
    void getAllBooks_Success() {
        when(bookRepository.findAll()).thenReturn(List.of(testBook));

        List<Book> result = bookService.getAllBooks();

        assertEquals(1, result.size());
        assertEquals("Clean Code", result.get(0).getTitle());
        verify(bookRepository, times(1)).findAll();
    }

    @Test
    void getBookById_Success() {
        when(bookRepository.findById(100L)).thenReturn(Optional.of(testBook));

        Book result = bookService.getBookById(100L);

        assertNotNull(result);
        assertEquals("Clean Code", result.getTitle());
        verify(bookRepository, times(1)).findById(100L);
    }

    @Test
    void getBookById_NotFound_ThrowsException() {
        when(bookRepository.findById(999L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            bookService.getBookById(999L);
        });

        assertTrue(exception.getMessage().contains("Không tìm thấy sách với ID: 999"));
    }

    @Test
    void createBook_Success() {
        when(bookRepository.findFirstByTitle("Clean Code")).thenReturn(Optional.empty());
        when(bookRepository.save(testBook)).thenReturn(testBook);

        Book created = bookService.createBook(testBook);

        assertNotNull(created);
        assertEquals("Clean Code", created.getTitle());
        verify(bookRepository).save(testBook);
    }

    @Test
    void createBook_DuplicateTitle_ThrowsException() {
        when(bookRepository.findFirstByTitle("Clean Code")).thenReturn(Optional.of(testBook));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            bookService.createBook(testBook);
        });

        assertTrue(exception.getMessage().contains("đã tồn tại trong hệ thống"));
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    void toggleFeaturedStatus_Success() {
        when(bookRepository.findById(100L)).thenReturn(Optional.of(testBook));
        when(bookRepository.save(testBook)).thenReturn(testBook);

        Book updated = bookService.toggleFeaturedStatus(100L, true);

        assertTrue(updated.getIsFeatured());
        verify(bookRepository).save(testBook);
    }

    @Test
    void searchBooks_CleanKeyword_RemovesPrefixes() {
        when(bookRepository.searchBooksByKeyword("clean code")).thenReturn(List.of(testBook));

        List<Book> result = bookService.searchBooks("sách Clean Code ");

        assertEquals(1, result.size());
        verify(bookRepository).searchBooksByKeyword("clean code");
    }

    @Test
    void searchBooks_EmptyKeyword_ReturnsEmptyList() {
        List<Book> result1 = bookService.searchBooks("");
        List<Book> result2 = bookService.searchBooks(null);

        assertTrue(result1.isEmpty());
        assertTrue(result2.isEmpty());
        verify(bookRepository, never()).searchBooksByKeyword(anyString());
    }

    @Test
    void deleteBook_Success() {
        doNothing().when(bookRepository).deleteById(100L);

        bookService.deleteBook(100L);

        verify(bookRepository, times(1)).deleteById(100L);
    }
}
