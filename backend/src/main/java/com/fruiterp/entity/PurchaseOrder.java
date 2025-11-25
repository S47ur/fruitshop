package com.fruiterp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchase_orders")
@EqualsAndHashCode(callSuper = true)
public class PurchaseOrder extends BaseEntity {
    @Column(nullable = false, length = 36)
    private String storeId;

    @Column(nullable = false, length = 36)
    private String supplierId;

    @Column(nullable = false, length = 30)
    private String status; // draft, submitted, receiving, received, reconciled, paid

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDate expectedDate;

    @Column(nullable = false)
    private Integer paymentTermDays;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;
}
