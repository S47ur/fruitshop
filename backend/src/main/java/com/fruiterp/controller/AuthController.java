package com.fruiterp.controller;

import com.fruiterp.common.ApiResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if ("admin".equals(username) && "admin123".equals(password)) {
            return ApiResponse.success(Map.of(
                    "username", "admin",
                    "name", "系统管理员",
                    "role", "owner",
                    "email", "admin@fruitshop.com"
            ));
        }
        if ("fruitboss".equals(username) && "boss123".equals(password)) {
            return ApiResponse.success(Map.of(
                    "username", "fruitboss",
                    "name", "水果老板",
                    "role", "owner",
                    "email", "boss@fruitshop.com"
            ));
        }
        return ApiResponse.error("用户名或密码错误");
    }
}
