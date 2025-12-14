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
@Table(name = "members")
public class Member {
    @Id
    private String id;
    
    private String name;
    private String phone;
    private BigDecimal balance = BigDecimal.ZERO;
    private BigDecimal points = BigDecimal.ZERO;
    private int level = 1;  // 1=铜牌, 2=银牌, 3=金牌
    private String tier;
    private BigDecimal totalSpend = BigDecimal.ZERO;
    private LocalDate joinDate;
}
