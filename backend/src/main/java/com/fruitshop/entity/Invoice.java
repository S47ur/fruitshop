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
@Table(name = "invoices")
public class Invoice {
    @Id
    private String id;
    
    private String storeId;
    private String salesOrderId;
    private LocalDate dueDate;
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.PENDING;
    
    public enum InvoiceStatus {
        PENDING, MATCHED, PAID, OVERDUE
    }
}
