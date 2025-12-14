package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_parameters")
public class SystemParameter {
    @Id
    private String paramKey;
    
    private String label;
    private String paramValue;
    
    @Column(length = 500)
    private String description;
}
