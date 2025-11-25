package com.fruiterp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "inventory")
@EqualsAndHashCode(callSuper = true)
public class Inventory extends BaseEntity {
    @Column(name = "product_id", nullable = false, length = 36)
    private String productId;

    @Column(name = "store_id", nullable = false, length = 36)
    private String storeId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(length = 50)
    private String batchNo;

    private LocalDate expireDate;
}
