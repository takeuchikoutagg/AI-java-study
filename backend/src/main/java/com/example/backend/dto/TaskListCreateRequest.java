package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record TaskListCreateRequest(
        @NotBlank(message = "name is required") String name
) {
}
