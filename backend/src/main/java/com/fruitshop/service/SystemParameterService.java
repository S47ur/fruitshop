package com.fruitshop.service;

import com.fruitshop.entity.SystemParameter;
import com.fruitshop.repository.SystemParameterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemParameterService {
    
    private final SystemParameterRepository parameterRepository;
    
    @Transactional
    public SystemParameter updateParameter(String key, String value) {
        SystemParameter param = parameterRepository.findById(key)
                .orElseGet(() -> {
                    SystemParameter newParam = new SystemParameter();
                    newParam.setParamKey(key);
                    newParam.setLabel(key);
                    newParam.setDescription("");
                    return newParam;
                });
        
        param.setParamValue(value);
        return parameterRepository.save(param);
    }
}
