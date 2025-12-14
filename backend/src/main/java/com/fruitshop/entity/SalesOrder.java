package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sales_orders")
public class SalesOrder {
    @Id
    private String id;
    
    private String storeId;
    private LocalDate date;
    private String customer;
    private String customerId;
    private String channel;
    private String fruit;
    private BigDecimal quantityKg;
    private BigDecimal unitPrice;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    private SalesStatus status = SalesStatus.PENDING;
    
    public enum SalesStatus {
        PENDING, SETTLED
    }
}
