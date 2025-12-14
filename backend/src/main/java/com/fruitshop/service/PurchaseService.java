package com.fruitshop.service;

import com.fruitshop.dto.PurchaseRequest;
import com.fruitshop.entity.*;
import com.fruitshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseService {
    
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    
    public List<PurchaseOrder> listByStore(String storeId) {
        return purchaseOrderRepository.findByStoreIdOrderByExpectedDateDesc(storeId);
    }
    
    @Transactional
    public PurchaseOrder create(String storeId, PurchaseRequest request) {
        PurchaseOrder order = new PurchaseOrder();
        order.setId("po-" + UUID.randomUUID().toString().substring(0, 8));
        order.setStoreId(storeId);
        order.setSupplierId(request.getSupplierId());
        order.setStatus(PurchaseOrder.PurchaseStatus.PENDING);
        order.setExpectedDate(request.getEta() != null ? LocalDate.parse(request.getEta()) : LocalDate.now());
        order.setPaymentTermDays(7);
        
        // 添加商品行
        for (PurchaseRequest.PurchaseItem item : request.getItems()) {
            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setProductId(item.getProductId());
            line.setQuantityKg(item.getQuantityKg());
            line.setUnitCost(item.getUnitCost());
            line.setBatchRequired(item.isBatchRequired());
            
            // 获取商品名称
            productRepository.findById(item.getProductId())
                    .ifPresent(product -> line.setFruit(product.getName()));
            
            order.addLine(line);
        }
        
        // 添加时间线事件
        order.addTimelineEvent(Instant.now().toString());
        
        PurchaseOrder saved = purchaseOrderRepository.save(order);
        
        // 更新库存
        applyToInventory(saved);
        
        return saved;
    }
    
    @Transactional
    public PurchaseOrder updateStatus(String id, String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("采购单不存在"));
        
        order.setStatus(PurchaseOrder.PurchaseStatus.valueOf(status.toUpperCase()));
        return purchaseOrderRepository.save(order);
    }
    
    private void applyToInventory(PurchaseOrder order) {
        for (PurchaseOrderLine line : order.getLines()) {
            String fruit = line.getFruit() != null ? line.getFruit() : line.getProductId();
            String inventoryId = "inv-" + order.getStoreId() + "-" + fruit;
            
            Inventory inventory = inventoryRepository.findById(inventoryId)
                    .orElseGet(() -> {
                        Inventory newInv = new Inventory();
                        newInv.setId(inventoryId);
                        newInv.setStoreId(order.getStoreId());
                        newInv.setFruit(fruit);
                        newInv.setProductId(line.getProductId());
                        newInv.setOnHandKg(BigDecimal.ZERO);
                        newInv.setUnitCost(line.getUnitCost());
                        newInv.setReorderLevelKg(new BigDecimal("80"));
                        newInv.setUnitPrice(line.getUnitCost().multiply(new BigDecimal("1.5")));
                        return newInv;
                    });
            
            // 加权平均成本计算
            BigDecimal totalKg = inventory.getOnHandKg().add(line.getQuantityKg());
            BigDecimal totalCost = inventory.getOnHandKg().multiply(inventory.getUnitCost())
                    .add(line.getQuantityKg().multiply(line.getUnitCost()));
            
            inventory.setOnHandKg(totalKg);
            if (totalKg.compareTo(BigDecimal.ZERO) > 0) {
                inventory.setUnitCost(totalCost.divide(totalKg, 2, BigDecimal.ROUND_HALF_UP));
            }
            
            inventoryRepository.save(inventory);
        }
    }
}
