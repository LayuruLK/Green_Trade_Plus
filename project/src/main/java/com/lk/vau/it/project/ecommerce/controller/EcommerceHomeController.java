package com.lk.vau.it.project.ecommerce.controller;

import com.lk.vau.it.project.ecommerce.model.EcommerceCategory;
import com.lk.vau.it.project.ecommerce.model.EcommercePromoBanner;
import com.lk.vau.it.project.ecommerce.model.EcommerceProduct;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = "*")

public class EcommerceHomeController {
    @GetMapping("/banners")
    public List<EcommercePromoBanner> getPromoBanners() {
        return Arrays.asList(
            new EcommercePromoBanner(1L, "https://via.placeholder.com/350x150.png?text=Promo+Banner")
        );
    }

    @GetMapping("/categories")
    public List<EcommerceCategory> getCategories() {
        return Arrays.asList(
            new EcommerceCategory(1L, "Plastic Boxes"),
            new EcommerceCategory(2L, "Steel Boxes"),
            new EcommerceCategory(3L, "Wooden Boxes")
        );
    }

    @GetMapping("/flash-sale")
    public List<EcommerceProduct> getFlashSaleItems() {
        return Arrays.asList(
            new EcommerceProduct(1L, "Box 1", "https://via.placeholder.com/100x100.png?text=Item1", 450.00),
            new EcommerceProduct(2L, "Box 2", "https://via.placeholder.com/100x100.png?text=Item2", 450.00),
            new EcommerceProduct(3L, "Box 3", "https://via.placeholder.com/100x100.png?text=Item3", 450.00)
        );
    }

    @GetMapping("/search")
    public List<EcommerceProduct> searchProducts(@RequestParam("query") String query) {
        // Dummy search response
        return Arrays.asList(
            new EcommerceProduct(4L, "Box A", "https://via.placeholder.com/100x100.png?text=ItemA", 350.00)
        );
    }
}
