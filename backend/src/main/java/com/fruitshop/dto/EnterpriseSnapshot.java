package com.fruitshop.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class EnterpriseSnapshot {
    private List<?> products;
    private List<?> partners;
    private List<?> roleMatrix;
    private List<?> approvalFlows;
    private List<?> integrations;
    private List<?> automations;
    private List<?> auditLogs;
    private List<?> parameters;
    private List<?> invoices;
    private List<?> adjustments;
    private List<?> channelConfigs;
    private List<?> aging;
    private List<?> users;
}
