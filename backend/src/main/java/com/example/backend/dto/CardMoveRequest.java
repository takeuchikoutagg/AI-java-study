package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CardMoveRequest(
        @NotNull(message = "listId is required") Long listId,
        @PositiveOrZero int position
) {
}
