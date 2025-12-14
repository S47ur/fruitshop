package com.fruitshop.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AdjustmentRequest {
    private String reason;
    private BigDecimal deltaKg;
    private String createdBy;
}
