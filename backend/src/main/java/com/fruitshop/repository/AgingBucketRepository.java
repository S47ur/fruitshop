package com.fruitshop.repository;

import com.fruitshop.entity.AgingBucket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgingBucketRepository extends JpaRepository<AgingBucket, String> {
}
