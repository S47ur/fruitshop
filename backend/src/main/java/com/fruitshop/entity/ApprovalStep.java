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
@Table(name = "approval_steps")
public class ApprovalStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "step_order")
    private int order;
    
    @Enumerated(EnumType.STRING)
    private User.UserRole approver;
    
    private String role;
    private BigDecimal threshold;
}
