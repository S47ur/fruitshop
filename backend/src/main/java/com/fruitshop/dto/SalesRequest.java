package com.fruitshop.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SalesRequest {
    private String date;
    private String customer;
    private String customerId;
    private String channel;
    private String fruit;
    private BigDecimal quantityKg;
    private BigDecimal unitPrice;
    private String paymentMethod;
    private String status;
}
