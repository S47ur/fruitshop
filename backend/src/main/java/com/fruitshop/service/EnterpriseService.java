package com.fruitshop.service;

import com.fruitshop.dto.EnterpriseSnapshot;
import com.fruitshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnterpriseService {
    
    private final ProductRepository productRepository;
    private final PartnerRepository partnerRepository;
    private final RoleMatrixRepository roleMatrixRepository;
    private final ApprovalFlowRepository approvalFlowRepository;
    private final IntegrationRepository integrationRepository;
    private final AutomationRepository automationRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemParameterRepository parameterRepository;
    private final InvoiceRepository invoiceRepository;
    private final AdjustmentRepository adjustmentRepository;
    private final ChannelConfigRepository channelConfigRepository;
    private final AgingBucketRepository agingBucketRepository;
    private final UserRepository userRepository;
    
    public EnterpriseSnapshot getSnapshot() {
        EnterpriseSnapshot snapshot = new EnterpriseSnapshot();
        
        snapshot.setProducts(productRepository.findAll());
        snapshot.setPartners(partnerRepository.findAll());
        snapshot.setRoleMatrix(roleMatrixRepository.findAll());
        snapshot.setApprovalFlows(approvalFlowRepository.findAll());
        snapshot.setIntegrations(integrationRepository.findAll());
        snapshot.setAutomations(automationRepository.findAll());
        snapshot.setAuditLogs(auditLogRepository.findAll());
        snapshot.setParameters(parameterRepository.findAll());
        snapshot.setInvoices(invoiceRepository.findAll());
        snapshot.setAdjustments(adjustmentRepository.findAll());
        snapshot.setChannelConfigs(channelConfigRepository.findAll());
        snapshot.setAging(agingBucketRepository.findAll());
        
        // 用户列表（隐藏密码）
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getUsername());
                    map.put("username", user.getUsername());
                    map.put("name", user.getName());
                    map.put("role", user.getRole().name());
                    map.put("email", user.getEmail());
                    map.put("status", "active");
                    return map;
                })
                .collect(Collectors.toList());
        snapshot.setUsers(users);
        
        return snapshot;
    }
}
