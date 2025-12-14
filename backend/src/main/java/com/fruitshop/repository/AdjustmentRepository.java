package com.fruitshop.repository;

import com.fruitshop.entity.Adjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdjustmentRepository extends JpaRepository<Adjustment, String> {
    List<Adjustment> findByInventoryIdOrderByCreatedAtDesc(String inventoryId);
}
