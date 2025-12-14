package com.fruitshop.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PurchaseRequest {
    private String supplierId;
    private String eta;
    private List<PurchaseItem> items;
    
    @Data
    public static class PurchaseItem {
        private String productId;
        private BigDecimal quantityKg;
        private BigDecimal unitCost;
        private boolean batchRequired;
    }
}
