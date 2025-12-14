package com.fruitshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    private String id;
    
    private String storeId;
    private String supplierId;
    
    @Enumerated(EnumType.STRING)
    private PurchaseStatus status = PurchaseStatus.PENDING;
    
    private LocalDate expectedDate;
    private int paymentTermDays = 7;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "purchase_order_id")
    private List<PurchaseOrderLine> lines = new ArrayList<>();
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "purchase_order_id")
    private List<TimelineEvent> timeline = new ArrayList<>();
    
    public enum PurchaseStatus {
        PENDING, PAID
    }
    
    public void addLine(PurchaseOrderLine line) {
        lines.add(line);
    }
    
    public void addTimelineEvent(String time) {
        TimelineEvent event = new TimelineEvent();
        event.setTime(time);
        timeline.add(event);
    }
}
