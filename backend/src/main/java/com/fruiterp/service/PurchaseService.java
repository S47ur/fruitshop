package com.fruiterp.service;

import com.fruiterp.common.ResourceNotFoundException;
import com.fruiterp.dto.*;
import com.fruiterp.entity.*;
import com.fruiterp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final PartnerRepository partnerRepository;
    private final ProductRepository productRepository;

    public List<PurchaseOrderDTO> listPurchases(String storeId) {
        List<PurchaseOrder> orders = purchaseOrderRepository.findByStoreId(storeId);
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseOrderDTO createPurchaseSimple(String storeId, Map<String, Object> request) {
        System.out.println("[PurchaseService] 开始处理采购订单，request: " + request);
        
        String supplierId = (String) request.get("supplierId");
        String productId = null;
        
        // 处理items数组格式
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
        
        if (items == null || items.isEmpty()) {
            System.out.println("[PurchaseService] items为空或null");
            throw new IllegalArgumentException("采购订单至少需要一个商品");
        }
        
        Map<String, Object> firstItem = items.get(0);
        productId = (String) firstItem.get("productId");
        
        System.out.println("[PurchaseService] supplierId: " + supplierId + ", productId: " + productId);
        
        // 验证供应商
        Partner supplier = null;
        if (supplierId != null && !supplierId.isEmpty()) {
            supplier = partnerRepository.findById(supplierId).orElse(null);
        }
        
        if (supplier == null) {
            System.out.println("[PurchaseService] 供应商不存在，尝试按名称查找");
            // 使用供应商名称查找
            String supplierName = (String) request.get("supplier");
            List<Partner> suppliers = partnerRepository.findByType("supplier");
            supplier = suppliers.stream()
                    .filter(s -> s.getName().equals(supplierName))
                    .findFirst()
                    .orElse(null);
            
            if (supplier == null) {
                System.out.println("[PurchaseService] 创建新供应商: " + supplierName);
                // 创建新供应商 - 手动分配ID
                Partner newSupplier = new Partner();
                newSupplier.setId("partner-" + System.currentTimeMillis());
                newSupplier.setType("supplier");
                newSupplier.setName(supplierName);
                newSupplier.setCreditLevel("A");
                newSupplier.setPaymentTermDays(30);
                newSupplier.setPaymentMethod((String) request.getOrDefault("paymentMethod", "transfer"));
                newSupplier.setOutstandingAmount(BigDecimal.ZERO);
                supplier = partnerRepository.save(newSupplier);
            }
        }

        // 查找商品
        Product product = null;
        if (productId != null && !productId.isEmpty()) {
            product = productRepository.findById(productId).orElse(null);
        }
        
        if (product == null) {
            System.out.println("[PurchaseService] 商品不存在: " + productId);
            throw new IllegalArgumentException("商品不存在");
        }

        // 创建采购订单 - 手动分配ID
        PurchaseOrder order = new PurchaseOrder();
        order.setId("purchase-" + System.currentTimeMillis());
        order.setStoreId(storeId);
        order.setSupplierId(supplier.getId());
        order.setStatus((String) request.getOrDefault("status", "draft"));
        
        String etaStr = (String) request.get("eta");
        order.setExpectedDate(LocalDate.parse(etaStr));
        order.setPaymentTermDays(supplier.getPaymentTermDays());

        // 计算总金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Map<String, Object> item : items) {
            BigDecimal quantityKg = new BigDecimal(item.get("quantityKg").toString());
            BigDecimal unitCost = new BigDecimal(item.get("unitCost").toString());
            totalAmount = totalAmount.add(quantityKg.multiply(unitCost));
        }
        order.setTotalAmount(totalAmount);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);
        System.out.println("[PurchaseService] 采购订单保存成功，ID: " + savedOrder.getId());

        // 创建采购订单明细 - 手动分配ID
        for (Map<String, Object> itemMap : items) {
            String itemProductId = (String) itemMap.get("productId");
            Product itemProduct = productRepository.findById(itemProductId)
                    .orElseThrow(() -> new IllegalArgumentException("商品不存在: " + itemProductId));
            
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setId("purchase-item-" + System.currentTimeMillis() + "-" + itemProductId);
            item.setPurchaseOrderId(savedOrder.getId());
            item.setProductId(itemProduct.getId());
            item.setQuantityKg(new BigDecimal(itemMap.get("quantityKg").toString()));
            item.setUnitCost(new BigDecimal(itemMap.get("unitCost").toString()));
            item.setBatchRequired((Boolean) itemMap.getOrDefault("batchRequired", false));
            purchaseOrderItemRepository.save(item);
            System.out.println("[PurchaseService] 采购明细保存成功，ID: " + item.getId());
        }

        PurchaseOrderDTO dto = convertToDTO(savedOrder);
        System.out.println("[PurchaseService] DTO转换完成，lines数量: " + (dto.getLines() != null ? dto.getLines().size() : 0));
        return dto;
    }

    @Transactional
    public PurchaseOrderDTO updatePurchaseStatus(String purchaseId, String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("采购订单不存在"));
        
        order.setStatus(status);
        PurchaseOrder updated = purchaseOrderRepository.save(order);
        return convertToDTO(updated);
    }

    private PurchaseOrderDTO convertToDTO(PurchaseOrder order) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(order.getId());
        dto.setStoreId(order.getStoreId());
        dto.setSupplierId(order.getSupplierId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setExpectedDate(order.getExpectedDate());
        dto.setPaymentTermDays(order.getPaymentTermDays());
        dto.setCreatedAt(order.getCreatedAt());

        // 加载明细 - 确保lines不为null
        List<PurchaseOrderItem> items = purchaseOrderItemRepository.findByPurchaseOrderId(order.getId());
        List<PurchaseOrderItemDTO> itemDTOs = items != null ? 
                items.stream().map(this::convertItemToDTO).collect(Collectors.toList()) :
                List.of();
        dto.setLines(itemDTOs);

        return dto;
    }

    private PurchaseOrderItemDTO convertItemToDTO(PurchaseOrderItem item) {
        PurchaseOrderItemDTO dto = new PurchaseOrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProductId());
        dto.setQuantityKg(item.getQuantityKg());
        dto.setUnitCost(item.getUnitCost());
        dto.setBatchRequired(item.getBatchRequired());

        // 获取商品名称
        productRepository.findById(item.getProductId())
                .ifPresent(product -> dto.setFruit(product.getName()));

        return dto;
    }
}
