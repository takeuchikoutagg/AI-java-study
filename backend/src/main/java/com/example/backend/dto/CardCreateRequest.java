package com.example.backend.dto;

import com.example.backend.entity.Priority;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CardCreateRequest(
        @NotBlank(message = "title is required") String title,
        LocalDate dueDate,
        Priority priority
) {
}
