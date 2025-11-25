package com.fruiterp.controller;

import com.fruiterp.common.ApiResponse;
import com.fruiterp.entity.Partner;
import com.fruiterp.entity.Product;
import com.fruiterp.repository.PartnerRepository;
import com.fruiterp.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/enterprise")
@RequiredArgsConstructor
public class EnterpriseController {
    private final ProductRepository productRepository;
    private final PartnerRepository partnerRepository;

    @GetMapping("/products")
    public ApiResponse<List<Product>> listProducts() {
        return ApiResponse.success(productRepository.findAll());
    }

    @GetMapping("/partners")
    public ApiResponse<List<Partner>> listPartners() {
        return ApiResponse.success(partnerRepository.findAll());
    }
}
