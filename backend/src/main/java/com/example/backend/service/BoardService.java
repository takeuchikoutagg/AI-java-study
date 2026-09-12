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
import java.util.Map;
import java.util.stream.Collectors;

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

        List<TaskList> taskLists = taskListRepository.findByBoardIdOrderBySortOrderAsc(board.getId());
        List<Long> listIds = taskLists.stream().map(TaskList::getId).toList();

        Map<Long, List<CardResponse>> cardsByListId = cardRepository
                .findByListIdInOrderBySortOrderAsc(listIds).stream()
                .collect(Collectors.groupingBy(
                        card -> card.getList().getId(),
                        Collectors.mapping(CardResponse::from, Collectors.toList())));

        List<TaskListResponse> lists = taskLists.stream()
                .map(list -> TaskListResponse.from(
                        list, cardsByListId.getOrDefault(list.getId(), List.of())))
                .toList();

        return BoardResponse.from(board, lists);
    }
}
