package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {
    @Id
    private String id;
    
    private String name;
    private String category;
    private String barcode;
    private String spec;
    private String unit;
    
    @Column(length = 500)
    private String description;
    
    private BigDecimal taxRate;
    
    // 定价策略
    private BigDecimal priceBase;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String currency = "CNY";
    
    @ElementCollection
    @CollectionTable(name = "product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
    
    private String status = "active";
    
    public enum ProductStatus {
        ACTIVE, ARCHIVED
    }
}
