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
@Table(name = "approval_flows")
public class ApprovalFlow {
    @Id
    private String id;
    
    private String name;
    private String documentType;
    
    @Column(name = "trigger_condition")
    private String trigger;
    
    private boolean enabled = true;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "approval_flow_id")
    private List<ApprovalStep> steps = new ArrayList<>();
    
    private String lastUpdated;
}
