package com.fruitshop.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReorderLevelRequest {
    private BigDecimal level;
}
