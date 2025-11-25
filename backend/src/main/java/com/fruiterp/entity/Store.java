package com.fruiterp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "stores")
@EqualsAndHashCode(callSuper = true)
public class Store extends BaseEntity {
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String address;

    @Column(length = 50)
    private String managerName;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 20)
    private String status;
}
