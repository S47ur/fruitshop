package com.fruitshop.repository;

import com.fruitshop.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    List<Inventory> findByStoreId(String storeId);
    Optional<Inventory> findByStoreIdAndFruit(String storeId, String fruit);
}
