package com.fruiterp.service;

import com.fruiterp.dto.RegisterRequest;
import com.fruiterp.entity.SysUser;
import com.fruiterp.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SysUserRepository sysUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void registerReadOnlyUser(RegisterRequest request) {
        if (sysUserRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        SysUser user = new SysUser();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole("READ_ONLY"); // Force READ_ONLY role
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        sysUserRepository.save(user);
    }
}
