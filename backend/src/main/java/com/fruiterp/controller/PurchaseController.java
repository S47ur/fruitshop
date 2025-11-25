package com.fruiterp.controller;

import com.fruiterp.common.ApiResponse;
import com.fruiterp.dto.PurchaseOrderDTO;
import com.fruiterp.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class PurchaseController {
    private final PurchaseService purchaseService;

    @GetMapping("/stores/{storeId}/purchases")
    public ApiResponse<List<PurchaseOrderDTO>> listPurchases(@PathVariable String storeId) {
        List<PurchaseOrderDTO> purchases = purchaseService.listPurchases(storeId);
        return ApiResponse.success(purchases);
    }

    @PostMapping("/stores/{storeId}/purchases")
    public ApiResponse<PurchaseOrderDTO> createPurchase(
            @PathVariable String storeId,
            @RequestBody Map<String, Object> request) {
        try {
            System.out.println("[PurchaseController] 收到采购订单请求: " + request);
            
            // 确保必需字段存在
            if (!request.containsKey("supplierId") || !request.containsKey("eta")) {
                return ApiResponse.error("缺少必需字段: supplierId 或 eta");
            }
            
            // 处理items数组
            if (!request.containsKey("items")) {
                return ApiResponse.error("缺少items字段");
            }
            
            PurchaseOrderDTO purchase = purchaseService.createPurchaseSimple(storeId, request);
            System.out.println("[PurchaseController] 采购订单创建成功，ID: " + purchase.getId());
            System.out.println("[PurchaseController] 订单明细数量: " + (purchase.getLines() != null ? purchase.getLines().size() : 0));
            
            return ApiResponse.success(purchase, "采购订单创建成功");
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("创建采购订单失败: " + e.getMessage());
        }
    }

    @PatchMapping("/purchases/{purchaseId}")
    public ApiResponse<PurchaseOrderDTO> updatePurchase(
            @PathVariable String purchaseId,
            @RequestBody Map<String, Object> updates) {
        String status = (String) updates.get("status");
        if (status != null) {
            PurchaseOrderDTO purchase = purchaseService.updatePurchaseStatus(purchaseId, status);
            return ApiResponse.success(purchase, "采购订单状态已更新");
        }
        return ApiResponse.error("无效的更新请求");
    }
}
