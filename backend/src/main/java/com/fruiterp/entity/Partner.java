package com.fruiterp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "partners")
@EqualsAndHashCode(callSuper = true)
public class Partner extends BaseEntity {
    @Column(nullable = false, length = 20)
    private String type; // supplier, customer

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String contact;

    @Column(length = 20)
    private String phone;

    @Column(length = 10)
    private String creditLevel;

    @Column(nullable = false)
    private Integer paymentTermDays;

    @Column(length = 20)
    private String paymentMethod;

    @Column(precision = 12, scale = 2)
    private BigDecimal outstandingAmount;
}
