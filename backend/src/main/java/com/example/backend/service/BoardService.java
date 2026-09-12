package com.example.backend.service;

import com.example.backend.dto.BoardResponse;
import com.example.backend.dto.CardResponse;
import com.example.backend.dto.TaskListResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CardRepository;
import com.example.backend.repository.TaskListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public BoardService(
            BoardRepository boardRepository,
            TaskListRepository taskListRepository,
            CardRepository cardRepository
    ) {
        this.boardRepository = boardRepository;
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    public BoardResponse getBoard() {
        Board board = boardRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        List<TaskListResponse> lists = taskListRepository
                .findByBoardIdOrderBySortOrderAsc(board.getId())
                .stream()
                .map(this::toTaskListResponse)
                .toList();

        return BoardResponse.from(board, lists);
    }

    private TaskListResponse toTaskListResponse(TaskList list) {
        List<CardResponse> cards = cardRepository
                .findByListIdOrderBySortOrderAsc(list.getId())
                .stream()
                .map(CardResponse::from)
                .toList();
        return TaskListResponse.from(list, cards);
    }
}
