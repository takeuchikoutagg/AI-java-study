package com.example.backend.dto;

import com.example.backend.entity.Board;

import java.util.List;

public record BoardResponse(
        Long id,
        String name,
        List<TaskListResponse> lists
) {

    public static BoardResponse from(Board board, List<TaskListResponse> lists) {
        return new BoardResponse(board.getId(), board.getName(), lists);
    }
}
