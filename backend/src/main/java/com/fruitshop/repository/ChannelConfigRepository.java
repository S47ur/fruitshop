package com.fruitshop.repository;

import com.fruitshop.entity.ChannelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelConfigRepository extends JpaRepository<ChannelConfig, String> {
}
