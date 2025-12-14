package com.fruitshop.controller;

import com.fruitshop.dto.*;
import com.fruitshop.entity.PurchaseOrder;
import com.fruitshop.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PurchaseController {
    
    private final PurchaseService purchaseService;
    
    @GetMapping("/stores/{storeId}/purchases")
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> listPurchases(@PathVariable String storeId) {
        List<PurchaseOrder> purchases = purchaseService.listByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(purchases));
    }
    
    @PostMapping("/stores/{storeId}/purchases")
    public ResponseEntity<ApiResponse<PurchaseOrder>> createPurchase(
            @PathVariable String storeId,
            @RequestBody PurchaseRequest request) {
        try {
            PurchaseOrder order = purchaseService.create(storeId, request);
            return ResponseEntity.ok(ApiResponse.success(order, "采购单创建成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PatchMapping("/purchases/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrder>> updatePurchaseStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        try {
            PurchaseOrder order = purchaseService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.success(order, "状态更新成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
