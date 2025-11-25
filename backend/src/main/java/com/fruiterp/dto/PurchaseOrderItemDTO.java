package com.fruiterp.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseOrderItemDTO {
    private String id;
    private String productId;
    private String fruit;
    private BigDecimal quantityKg;
    private BigDecimal unitCost;
    private Boolean batchRequired;
}
