package com.fruiterp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "products")
@EqualsAndHashCode(callSuper = true)
public class Product extends BaseEntity {
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 50)
    private String barcode;

    @Column(length = 50)
    private String spec;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(precision = 5, scale = 2)
    private java.math.BigDecimal taxRate;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal priceBase;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal priceMin;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal priceMax;

    @Column(nullable = false, length = 20)
    private String status;
}
