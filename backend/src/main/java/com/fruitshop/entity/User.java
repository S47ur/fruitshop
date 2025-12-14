package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    private String email;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_stores", joinColumns = @JoinColumn(name = "username"))
    @Column(name = "store_id")
    private List<String> storeIds = new ArrayList<>();
    
    public enum UserRole {
        ROLE_OWNER, ROLE_MANAGER, ROLE_CASHIER, ROLE_AUDITOR
    }
}
