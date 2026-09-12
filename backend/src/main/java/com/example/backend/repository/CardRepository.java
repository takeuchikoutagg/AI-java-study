package com.example.backend.repository;

import com.example.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByListIdOrderBySortOrderAsc(Long listId);

    List<Card> findByListIdInOrderBySortOrderAsc(List<Long> listIds);

    int countByListId(Long listId);

    @Modifying
    void deleteByListId(Long listId);
}
