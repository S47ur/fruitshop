package com.fruitshop.dto;

import lombok.Data;

@Data
public class RegisterResponse {
    private boolean success;
    private String message;
    private UserInfo user;
    
    @Data
    public static class UserInfo {
        private String username;
        private String name;
        private String role;
        private String email;
    }
}
