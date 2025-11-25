package com.fruiterp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
@EqualsAndHashCode(callSuper = true)
public class Order extends BaseEntity {
    @Column(nullable = false, length = 50, unique = true)
    private String orderNo;

    @Column(nullable = false, length = 20)
    private String type; // SALES, PURCHASE

    @Column(name = "partner_id", length = 36)
    private String partnerId;

    @Column(name = "store_id", length = 36)
    private String storeId;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 36)
    private String createdBy;

    private LocalDateTime createdAt;
}
