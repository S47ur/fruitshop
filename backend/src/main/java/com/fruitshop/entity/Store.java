package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stores")
public class Store {
    @Id
    private String id;
    
    private String name;
    private String city;
    private String code;
    private String address;
    private String phone;
}
