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
@Table(name = "channel_configs")
public class ChannelConfig {
    @Id
    private String id;
    
    private String name;
    private boolean enabled;
    private BigDecimal revenueShare;
    private int settlementDays;
    private BigDecimal feeRate;
    
    @Enumerated(EnumType.STRING)
    private SplitMode splitMode;
    
    public enum SplitMode {
        GROSS, NET
    }
}
