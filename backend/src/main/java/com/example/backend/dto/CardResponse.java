package com.example.backend.dto;

import com.example.backend.entity.Card;
import com.example.backend.entity.Priority;

import java.time.LocalDate;

public record CardResponse(
        Long id,
        String title,
        LocalDate dueDate,
        Priority priority,
        int sortOrder
) {

    public static CardResponse from(Card card) {
        return new CardResponse(
                card.getId(),
                card.getTitle(),
                card.getDueDate(),
                card.getPriority(),
                card.getSortOrder()
        );
    }
}
