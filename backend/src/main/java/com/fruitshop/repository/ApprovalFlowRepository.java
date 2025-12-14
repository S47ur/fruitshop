package com.fruitshop.repository;

import com.fruitshop.entity.ApprovalFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalFlowRepository extends JpaRepository<ApprovalFlow, String> {
}
