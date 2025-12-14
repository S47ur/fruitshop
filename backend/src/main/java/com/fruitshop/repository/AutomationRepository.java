package com.fruitshop.repository;

import com.fruitshop.entity.Automation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AutomationRepository extends JpaRepository<Automation, String> {
}
