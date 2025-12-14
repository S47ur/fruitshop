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
@Table(name = "aging_buckets")
public class AgingBucket {
    @Id
    private String id;
    
    private String bucket;
    private String label;
    private int minDays;
    private int maxDays;
    private BigDecimal amount;
    
    private BigDecimal receivables;
    private BigDecimal payables;
}
