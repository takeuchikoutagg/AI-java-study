package com.example.backend.dto;

import com.example.backend.entity.Priority;

import java.time.LocalDate;

public record CardUpdateRequest(
        String title,
        LocalDate dueDate,
        Priority priority
) {
}
