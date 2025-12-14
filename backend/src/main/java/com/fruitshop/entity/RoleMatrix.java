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
@Table(name = "role_matrix")
public class RoleMatrix {
    @Id
    @Enumerated(EnumType.STRING)
    private User.UserRole role;
    
    private String label;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role"))
    @Column(name = "permission")
    private List<String> permissions = new ArrayList<>();
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_data_domains", joinColumns = @JoinColumn(name = "role"))
    @Column(name = "data_domain")
    private List<String> dataDomains = new ArrayList<>();
}
