package com.fruitshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private T data;
    private String message;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, null);
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, message);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(null, message);
    }
}
