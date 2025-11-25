package com.fruiterp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "purchase_order_items")
@EqualsAndHashCode(callSuper = true)
public class PurchaseOrderItem extends BaseEntity {
    @Column(nullable = false, length = 36)
    private String purchaseOrderId;

    @Column(nullable = false, length = 36)
    private String productId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityKg;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(nullable = false)
    private Boolean batchRequired;
}
