package com.fruiterp.controller;

import com.fruiterp.common.ApiResponse;
import com.fruiterp.dto.RegisterRequest;
import com.fruiterp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register/readonly")
    public ApiResponse<String> registerReadOnly(@Valid @RequestBody RegisterRequest request) {
        userService.registerReadOnlyUser(request);
        return ApiResponse.success("User registered successfully with READ_ONLY access.");
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            
            User user = (User) authentication.getPrincipal();
            String role = user.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .orElse("UNKNOWN");

            return ApiResponse.success(Map.of(
                    "username", username,
                    "role", role,
                    "token", "dummy-token-for-now" // In a real app, generate JWT here
            ));
        } catch (Exception e) {
            return ApiResponse.error("用户名或密码错误");
        }
    }
}
