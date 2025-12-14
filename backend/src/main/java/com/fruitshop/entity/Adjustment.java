package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "adjustments")
public class Adjustment {
    @Id
    private String id;
    
    private String inventoryId;
    private String reason;
    private BigDecimal deltaKg;
    private String createdBy;
    private LocalDateTime createdAt;
}
