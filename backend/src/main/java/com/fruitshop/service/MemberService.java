package com.fruitshop.service;

import com.fruitshop.entity.Member;
import com.fruitshop.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {
    
    private final MemberRepository memberRepository;
    
    public List<Member> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return memberRepository.findByPhoneContainingOrNameContaining(keyword, keyword);
    }
    
    public Optional<Member> findById(String memberId) {
        return memberRepository.findById(memberId);
    }
}
