package com.fruitshop.service;

import com.fruitshop.dto.AdjustmentRequest;
import com.fruitshop.entity.Adjustment;
import com.fruitshop.entity.Inventory;
import com.fruitshop.repository.AdjustmentRepository;
import com.fruitshop.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {
    
    private final InventoryRepository inventoryRepository;
    private final AdjustmentRepository adjustmentRepository;
    
    public List<Inventory> listByStore(String storeId) {
        return inventoryRepository.findByStoreId(storeId);
    }
    
    @Transactional
    public Inventory updateReorderLevel(String inventoryId, BigDecimal level) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("库存记录不存在"));
        
        inventory.setReorderLevelKg(level);
        return inventoryRepository.save(inventory);
    }
    
    @Transactional
    public Adjustment createAdjustment(String inventoryId, AdjustmentRequest request) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("库存记录不存在"));
        
        // 更新库存数量
        BigDecimal newQty = inventory.getOnHandKg().add(request.getDeltaKg());
        inventory.setOnHandKg(newQty.max(BigDecimal.ZERO));
        inventoryRepository.save(inventory);
        
        // 创建调整记录
        Adjustment adjustment = new Adjustment();
        adjustment.setId("adj-" + UUID.randomUUID().toString().substring(0, 8));
        adjustment.setInventoryId(inventoryId);
        adjustment.setReason(request.getReason() != null ? request.getReason() : "调整");
        adjustment.setDeltaKg(request.getDeltaKg());
        adjustment.setCreatedBy(request.getCreatedBy() != null ? request.getCreatedBy() : "系统");
        adjustment.setCreatedAt(LocalDateTime.now());
        
        return adjustmentRepository.save(adjustment);
    }
}
