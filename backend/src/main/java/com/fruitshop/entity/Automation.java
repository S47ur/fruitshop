package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "automations")
public class Automation {
    @Id
    private String id;
    
    private String name;
    
    @Column(length = 500)
    private String description;
    
    private String schedule;
    
    @Enumerated(EnumType.STRING)
    private AutomationChannel channel;
    
    private boolean enabled;
    private String lastRun;
    private int lastExecutionCount = 0;
    
    public enum AutomationChannel {
        EMAIL, SMS, WECHAT
    }
}
