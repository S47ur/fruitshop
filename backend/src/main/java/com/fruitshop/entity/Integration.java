package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "integrations")
public class Integration {
    @Id
    private String id;
    
    private String name;
    private String type;
    
    private String target;
    private String secret;
    
    private boolean connected;
    private LocalDateTime lastSync;
    
    @Enumerated(EnumType.STRING)
    private IntegrationStatus status;
    
    public enum IntegrationType {
        API, WEBHOOK, FTP
    }
    
    public enum IntegrationStatus {
        ACTIVE, PAUSED
    }
}
