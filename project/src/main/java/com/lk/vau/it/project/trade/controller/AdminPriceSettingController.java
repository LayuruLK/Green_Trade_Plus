package com.lk.vau.it.project.trade.controller;


import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.lk.vau.it.project.trade.dto.AdminPriceSettingDto;
import com.lk.vau.it.project.trade.service.AdminPriceSettingService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/price-settings")
public class AdminPriceSettingController {

    private final AdminPriceSettingService priceSettingService;

    @Autowired
    public AdminPriceSettingController(AdminPriceSettingService priceSettingService) {
        this.priceSettingService = priceSettingService;
    }

    /**
     * Create a new price setting
     */
    @PostMapping
    public ResponseEntity<AdminPriceSettingDto> createPriceSetting(
            @Valid @RequestBody AdminPriceSettingDto priceSettingDto) {
        String adminUsername = getCurrentUsername();
        AdminPriceSettingDto createdPriceSetting = priceSettingService.createPriceSetting(priceSettingDto, adminUsername);
        return new ResponseEntity<>(createdPriceSetting, HttpStatus.CREATED);
    }

    /**
     * Update an existing price setting
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdminPriceSettingDto> updatePriceSetting(
            @PathVariable Long id,
            @Valid @RequestBody AdminPriceSettingDto priceSettingDto) {
        String adminUsername = getCurrentUsername();
        AdminPriceSettingDto updatedPriceSetting = priceSettingService.updatePriceSetting(id, priceSettingDto, adminUsername);
        return ResponseEntity.ok(updatedPriceSetting);
    }

    /**
     * Get a price setting by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminPriceSettingDto> getPriceSettingById(@PathVariable Long id) {
        AdminPriceSettingDto priceSetting = priceSettingService.getPriceSettingById(id);
        return ResponseEntity.ok(priceSetting);
    }

    /**
     * Get all price settings
     */
    @GetMapping
    public ResponseEntity<List<AdminPriceSettingDto>> getAllPriceSettings() {
        List<AdminPriceSettingDto> priceSettings = priceSettingService.getAllPriceSettings();
        return ResponseEntity.ok(priceSettings);
    }

    /**
     * Get price settings by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<AdminPriceSettingDto>> getPriceSettingsByCategory(@PathVariable String category) {
        List<AdminPriceSettingDto> priceSettings = priceSettingService.getAllPriceSettingsByCategory(category);
        return ResponseEntity.ok(priceSettings);
    }

    /**
     * Get price setting by category and item name
     */
    @GetMapping("/find")
    public ResponseEntity<AdminPriceSettingDto> getPriceSettingByCategoryAndItemName(
            @RequestParam String category, 
            @RequestParam String itemName) {
        AdminPriceSettingDto priceSetting = 
            priceSettingService.getPriceSettingByCategoryAndItemName(category, itemName);
        return ResponseEntity.ok(priceSetting);
    }

    /**
     * Get all available categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = priceSettingService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Get all items for a category
     */
    @GetMapping("/categories/{category}/items")
    public ResponseEntity<List<String>> getItemsByCategory(@PathVariable String category) {
        List<String> items = priceSettingService.getAllItemNamesByCategory(category);
        return ResponseEntity.ok(items);
    }

    /**
     * Delete a price setting by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePriceSetting(@PathVariable Long id) {
        priceSettingService.deletePriceSetting(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Price setting deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Initialize predefined categories and items
     */
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, String>> initializePredefinedItems() {
        priceSettingService.initializePredefinedItems();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Predefined items initialized successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Handle validation errors and other exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Get current authenticated userName
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }
}