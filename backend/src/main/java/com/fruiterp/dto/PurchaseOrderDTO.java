package com.fruiterp.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseOrderDTO {
    private String id;
    private String storeId;
    private String supplierId;
    private String status;
    private BigDecimal totalAmount;
    private LocalDate expectedDate;
    private Integer paymentTermDays;
    private List<PurchaseOrderItemDTO> lines;
    private LocalDateTime createdAt;
}
