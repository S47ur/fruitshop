package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "partners")
public class Partner {
    @Id
    private String id;
    
    @Enumerated(EnumType.STRING)
    private PartnerType type;
    
    private String name;
    private String contact;
    private String contactName;
    private String phone;
    private String email;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod settlementMethod;
    
    private int paymentTermDays = 30;
    private String status = "active";
    
    private BigDecimal outstandingAmount = BigDecimal.ZERO;
    private BigDecimal totalVolumeKg = BigDecimal.ZERO;
    private boolean preferred;
    
    @Column(length = 1000)
    private String historyNotes;
    
    public enum PartnerType {
        SUPPLIER, CUSTOMER
    }
}
