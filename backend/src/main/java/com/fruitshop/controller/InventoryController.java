package com.fruitshop.controller;

import com.fruitshop.dto.*;
import com.fruitshop.entity.Adjustment;
import com.fruitshop.entity.Inventory;
import com.fruitshop.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    @GetMapping("/stores/{storeId}/inventory")
    public ResponseEntity<ApiResponse<List<Inventory>>> listInventory(@PathVariable String storeId) {
        List<Inventory> inventory = inventoryService.listByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(inventory));
    }
    
    @PatchMapping("/inventory/{id}/reorder-level")
    public ResponseEntity<ApiResponse<Inventory>> updateReorderLevel(
            @PathVariable String id,
            @RequestBody ReorderLevelRequest request) {
        try {
            Inventory inventory = inventoryService.updateReorderLevel(id, request.getLevel());
            return ResponseEntity.ok(ApiResponse.success(inventory, "预警线更新成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/inventory/{id}/adjustments")
    public ResponseEntity<ApiResponse<Adjustment>> createAdjustment(
            @PathVariable String id,
            @RequestBody AdjustmentRequest request) {
        try {
            Adjustment adjustment = inventoryService.createAdjustment(id, request);
            return ResponseEntity.ok(ApiResponse.success(adjustment, "调整成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
