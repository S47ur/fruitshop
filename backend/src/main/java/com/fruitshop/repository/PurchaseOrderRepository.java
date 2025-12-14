package com.fruitshop.repository;

import com.fruitshop.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {
    List<PurchaseOrder> findByStoreIdOrderByExpectedDateDesc(String storeId);
}
