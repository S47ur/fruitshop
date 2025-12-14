package com.fruitshop.controller;

import com.fruitshop.dto.ApiResponse;
import com.fruitshop.entity.Member;
import com.fruitshop.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {
    
    private final MemberService memberService;
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Member>>> search(@RequestParam String keyword) {
        List<Member> members = memberService.search(keyword);
        return ResponseEntity.ok(ApiResponse.success(members));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Member>> getById(@PathVariable String id) {
        return memberService.findById(id)
                .map(member -> ResponseEntity.ok(ApiResponse.success(member)))
                .orElse(ResponseEntity.notFound().build());
    }
}
