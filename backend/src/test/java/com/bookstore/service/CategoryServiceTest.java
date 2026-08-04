package com.bookstore.service;

import com.bookstore.entity.Category;
import com.bookstore.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Tiểu Thuyết")
                .description("Các tác phẩm tiểu thuyết nổi tiếng")
                .isFeatured(true)
                .build();
    }

    @Test
    void getAllCategories_Success() {
        when(categoryRepository.findAll()).thenReturn(List.of(testCategory));

        List<Category> categories = categoryService.getAllCategories();

        assertEquals(1, categories.size());
        assertEquals("Tiểu Thuyết", categories.get(0).getName());
        verify(categoryRepository).findAll();
    }

    @Test
    void getCategoryById_Success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));

        Category category = categoryService.getCategoryById(1L);

        assertNotNull(category);
        assertEquals("Tiểu Thuyết", category.getName());
        verify(categoryRepository).findById(1L);
    }

    @Test
    void getCategoryById_NotFound_ThrowsException() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            categoryService.getCategoryById(99L);
        });

        assertTrue(exception.getMessage().contains("Không tìm thấy danh mục với ID: 99"));
    }

    @Test
    void createCategory_Success() {
        when(categoryRepository.save(testCategory)).thenReturn(testCategory);

        Category created = categoryService.createCategory(testCategory);

        assertNotNull(created);
        assertEquals("Tiểu Thuyết", created.getName());
        verify(categoryRepository).save(testCategory);
    }

    @Test
    void updateCategory_Success() {
        Category updatedDetails = Category.builder()
                .name("Tiểu Thuyết Văn Học")
                .description("Danh mục cập nhật")
                .isFeatured(false)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Category updated = categoryService.updateCategory(1L, updatedDetails);

        assertEquals("Tiểu Thuyết Văn Học", updated.getName());
        assertEquals("Danh mục cập nhật", updated.getDescription());
        assertFalse(updated.isFeatured());
        verify(categoryRepository).save(testCategory);
    }

    @Test
    void deleteCategory_Success() {
        doNothing().when(categoryRepository).deleteById(1L);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).deleteById(1L);
    }
}
