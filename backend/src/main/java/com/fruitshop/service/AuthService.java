package com.fruitshop.service;

import com.fruitshop.dto.LoginRequest;
import com.fruitshop.dto.LoginResponse;
import com.fruitshop.dto.RegisterRequest;
import com.fruitshop.dto.RegisterResponse;
import com.fruitshop.entity.RoleMatrix;
import com.fruitshop.entity.Store;
import com.fruitshop.entity.User;
import com.fruitshop.repository.RoleMatrixRepository;
import com.fruitshop.repository.StoreRepository;
import com.fruitshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final RoleMatrixRepository roleMatrixRepository;
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("账号或密码不正确"));
        
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("账号或密码不正确");
        }
        
        // 获取用户可访问的门店
        List<Store> stores = storeRepository.findAllById(user.getStoreIds());
        
        // 获取角色权限
        List<String> permissions = roleMatrixRepository.findById(user.getRole())
                .map(RoleMatrix::getPermissions)
                .orElse(Collections.emptyList());
        
        // 构建响应
        LoginResponse response = new LoginResponse();
        response.setToken("token-" + UUID.randomUUID().toString());
        
        LoginResponse.UserDto userDto = new LoginResponse.UserDto();
        userDto.setUsername(user.getUsername());
        userDto.setName(user.getName());
        userDto.setRole(user.getRole().name());
        userDto.setEmail(user.getEmail());
        response.setUser(userDto);
        
        response.setStores(stores);
        response.setPermissions(permissions);
        
        return response;
    }
    
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 根据邀请码确定角色
        User.UserRole role = "ADMIN888".equals(request.getInviteCode()) 
                ? User.UserRole.ROLE_OWNER 
                : User.UserRole.ROLE_CASHIER;
        
        // 获取默认门店
        List<Store> allStores = storeRepository.findAll();
        List<String> defaultStoreIds = allStores.isEmpty() 
                ? Collections.emptyList() 
                : Collections.singletonList(allStores.get(0).getId());
        
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setName(request.getName());
        user.setRole(role);
        user.setEmail(request.getUsername() + "@fruitshop.com");
        user.setStoreIds(defaultStoreIds);
        
        userRepository.save(user);
        
        // 构建响应
        RegisterResponse response = new RegisterResponse();
        response.setSuccess(true);
        response.setMessage("注册成功，请登录");
        
        RegisterResponse.UserInfo userInfo = new RegisterResponse.UserInfo();
        userInfo.setUsername(user.getUsername());
        userInfo.setName(user.getName());
        userInfo.setRole(user.getRole().name());
        userInfo.setEmail(user.getEmail());
        response.setUser(userInfo);
        
        return response;
    }
}
