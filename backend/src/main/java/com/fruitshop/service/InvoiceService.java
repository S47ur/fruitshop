package com.fruitshop.service;

import com.fruitshop.entity.Invoice;
import com.fruitshop.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    
    private final InvoiceRepository invoiceRepository;
    
    public List<Invoice> listByStore(String storeId) {
        return invoiceRepository.findByStoreId(storeId);
    }
    
    @Transactional
    public Invoice updateStatus(String invoiceId, String status) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("发票不存在"));
        
        invoice.setStatus(Invoice.InvoiceStatus.valueOf(status.toUpperCase()));
        return invoiceRepository.save(invoice);
    }
}
