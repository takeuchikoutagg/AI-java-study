package com.example.backend.dto;

import com.example.backend.entity.TaskList;

import java.util.List;

public record TaskListResponse(
        Long id,
        String name,
        int sortOrder,
        List<CardResponse> cards
) {

    public static TaskListResponse from(TaskList list, List<CardResponse> cards) {
        return new TaskListResponse(list.getId(), list.getName(), list.getSortOrder(), cards);
    }
}
