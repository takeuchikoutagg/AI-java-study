package com.example.backend.dto;

import com.example.backend.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CardCreateRequest(
        @NotBlank(message = "title is required")
        @Size(max = 255, message = "title must be 255 characters or fewer")
        String title,
        LocalDate dueDate,
        Priority priority
) {
}
