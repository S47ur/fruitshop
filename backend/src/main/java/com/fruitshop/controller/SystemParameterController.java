package com.fruitshop.controller;

import com.fruitshop.dto.ApiResponse;
import com.fruitshop.dto.ParameterUpdateRequest;
import com.fruitshop.entity.SystemParameter;
import com.fruitshop.service.SystemParameterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system")
@RequiredArgsConstructor
public class SystemParameterController {
    
    private final SystemParameterService parameterService;
    
    @PutMapping("/parameters/{key}")
    public ResponseEntity<ApiResponse<SystemParameter>> updateParameter(
            @PathVariable String key,
            @RequestBody ParameterUpdateRequest request) {
        try {
            SystemParameter param = parameterService.updateParameter(key, request.getValue());
            return ResponseEntity.ok(ApiResponse.success(param, "参数更新成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
