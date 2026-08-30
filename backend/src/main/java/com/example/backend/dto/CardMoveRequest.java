package com.example.backend.dto;

public record CardMoveRequest(
        Long listId,
        int position
) {
}
