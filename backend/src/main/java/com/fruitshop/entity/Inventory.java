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
@Table(name = "inventory")
public class Inventory {
    @Id
    private String id;
    
    private String storeId;
    private String fruit;
    private String productId;
    private BigDecimal onHandKg = BigDecimal.ZERO;
    private BigDecimal unitCost = BigDecimal.ZERO;
    private BigDecimal reorderLevelKg = new BigDecimal("80");
    private BigDecimal unitPrice = BigDecimal.ZERO;
}
