package com.fruitshop.repository;

import com.fruitshop.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    List<Member> findByPhoneContainingOrNameContaining(String phone, String name);
}
