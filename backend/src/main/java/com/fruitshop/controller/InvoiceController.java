package com.fruitshop.controller;

import com.fruitshop.dto.*;
import com.fruitshop.entity.Invoice;
import com.fruitshop.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InvoiceController {
    
    private final InvoiceService invoiceService;
    
    @GetMapping("/stores/{storeId}/invoices")
    public ResponseEntity<ApiResponse<List<Invoice>>> listInvoices(@PathVariable String storeId) {
        List<Invoice> invoices = invoiceService.listByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(invoices));
    }
    
    @PatchMapping("/invoices/{id}")
    public ResponseEntity<ApiResponse<Invoice>> updateInvoiceStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        try {
            Invoice invoice = invoiceService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.success(invoice, "发票状态更新成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
