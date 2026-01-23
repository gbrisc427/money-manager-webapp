package com.money.manager.webapp.service;

import com.money.manager.webapp.dto.CategoryRequest;
import com.money.manager.webapp.model.Category;
import com.money.manager.webapp.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getAllCategories(Long userId) {
        return categoryRepository.findByUserId(userId);
    }

    @Transactional
    public Category createCategory(CategoryRequest request, Long userId) {
        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .color(request.getColor() != null ? request.getColor() : "#CCCCCC")
                .userId(userId)
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id, Long userId) {
        Category category = categoryRepository.findById(id)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        categoryRepository.delete(category);
    }
}