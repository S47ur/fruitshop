package com.fruitshop.dto;

import com.fruitshop.entity.Store;
import com.fruitshop.entity.User;
import lombok.Data;
import java.util.List;

@Data
public class LoginResponse {
    private String token;
    private UserDto user;
    private List<Store> stores;
    private List<String> permissions;
    
    @Data
    public static class UserDto {
        private String username;
        private String name;
        private String role;
        private String email;
    }
}
