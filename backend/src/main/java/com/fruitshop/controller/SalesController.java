package com.fruitshop.controller;

import com.fruitshop.dto.*;
import com.fruitshop.entity.SalesOrder;
import com.fruitshop.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SalesController {
    
    private final SalesService salesService;
    
    @GetMapping("/stores/{storeId}/sales")
    public ResponseEntity<ApiResponse<List<SalesOrder>>> listSales(@PathVariable String storeId) {
        List<SalesOrder> sales = salesService.listByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(sales));
    }
    
    @PostMapping("/stores/{storeId}/sales")
    public ResponseEntity<ApiResponse<SalesOrder>> createSale(
            @PathVariable String storeId,
            @RequestBody SalesRequest request) {
        try {
            SalesOrder order = salesService.create(storeId, request);
            return ResponseEntity.ok(ApiResponse.success(order, "销售单创建成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PatchMapping("/sales/{id}/settle")
    public ResponseEntity<ApiResponse<SalesOrder>> settleSale(@PathVariable String id) {
        try {
            SalesOrder order = salesService.settle(id);
            return ResponseEntity.ok(ApiResponse.success(order, "结算成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
