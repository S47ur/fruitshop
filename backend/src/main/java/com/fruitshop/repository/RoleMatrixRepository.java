package com.fruitshop.repository;

import com.fruitshop.entity.RoleMatrix;
import com.fruitshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleMatrixRepository extends JpaRepository<RoleMatrix, User.UserRole> {
}
