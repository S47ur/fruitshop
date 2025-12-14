package com.fruitshop.repository;

import com.fruitshop.entity.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, String> {
    List<SalesOrder> findByStoreIdOrderByDateDesc(String storeId);
}
