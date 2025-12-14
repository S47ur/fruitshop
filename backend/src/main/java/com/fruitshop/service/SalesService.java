package com.fruitshop.service;

import com.fruitshop.dto.SalesRequest;
import com.fruitshop.entity.Inventory;
import com.fruitshop.entity.PaymentMethod;
import com.fruitshop.entity.SalesOrder;
import com.fruitshop.repository.InventoryRepository;
import com.fruitshop.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalesService {
    
    private final SalesOrderRepository salesOrderRepository;
    private final InventoryRepository inventoryRepository;
    
    public List<SalesOrder> listByStore(String storeId) {
        return salesOrderRepository.findByStoreIdOrderByDateDesc(storeId);
    }
    
    @Transactional
    public SalesOrder create(String storeId, SalesRequest request) {
        SalesOrder order = new SalesOrder();
        order.setId("so-" + UUID.randomUUID().toString().substring(0, 8));
        order.setStoreId(storeId);
        order.setDate(request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now());
        order.setCustomer(request.getCustomer());
        order.setCustomerId(request.getCustomerId());
        order.setChannel(request.getChannel());
        order.setFruit(request.getFruit());
        order.setQuantityKg(request.getQuantityKg());
        order.setUnitPrice(request.getUnitPrice());
        
        if (request.getPaymentMethod() != null) {
            order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        } else {
            order.setPaymentMethod(PaymentMethod.CASH);
        }
        
        if (request.getStatus() != null && "settled".equalsIgnoreCase(request.getStatus())) {
            order.setStatus(SalesOrder.SalesStatus.SETTLED);
        } else {
            order.setStatus(SalesOrder.SalesStatus.PENDING);
        }
        
        SalesOrder saved = salesOrderRepository.save(order);
        
        // 扣减库存
        applyToInventory(saved);
        
        return saved;
    }
    
    @Transactional
    public SalesOrder settle(String id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("销售单不存在"));
        
        order.setStatus(SalesOrder.SalesStatus.SETTLED);
        return salesOrderRepository.save(order);
    }
    
    private void applyToInventory(SalesOrder order) {
        inventoryRepository.findByStoreIdAndFruit(order.getStoreId(), order.getFruit())
                .ifPresent(inventory -> {
                    BigDecimal newQty = inventory.getOnHandKg().subtract(order.getQuantityKg());
                    inventory.setOnHandKg(newQty.max(BigDecimal.ZERO));
                    inventoryRepository.save(inventory);
                });
    }
}
