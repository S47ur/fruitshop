package com.fruitshop.controller;

import com.fruitshop.dto.ApiResponse;
import com.fruitshop.dto.EnterpriseSnapshot;
import com.fruitshop.service.EnterpriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/enterprise")
@RequiredArgsConstructor
public class EnterpriseController {
    
    private final EnterpriseService enterpriseService;
    
    @GetMapping("/snapshot")
    public ResponseEntity<ApiResponse<EnterpriseSnapshot>> getSnapshot() {
        EnterpriseSnapshot snapshot = enterpriseService.getSnapshot();
        return ResponseEntity.ok(ApiResponse.success(snapshot));
    }
}
