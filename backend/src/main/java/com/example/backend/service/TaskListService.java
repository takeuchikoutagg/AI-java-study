package com.example.backend.service;

import com.example.backend.dto.TaskListCreateRequest;
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
@Transactional
public class TaskListService {

    private final BoardRepository boardRepository;
    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public TaskListService(
            BoardRepository boardRepository,
            TaskListRepository taskListRepository,
            CardRepository cardRepository
    ) {
        this.boardRepository = boardRepository;
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    public TaskListResponse createList(TaskListCreateRequest request) {
        Board board = boardRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        int nextSortOrder = taskListRepository.countByBoardId(board.getId());
        TaskList list = new TaskList(board, request.name(), nextSortOrder);
        TaskList saved = taskListRepository.save(list);

        return TaskListResponse.from(saved, List.of());
    }

    public void deleteList(Long listId) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        Long boardId = list.getBoard().getId();

        cardRepository.deleteByListId(listId);
        taskListRepository.delete(list);

        List<TaskList> remaining = taskListRepository.findByBoardIdOrderBySortOrderAsc(boardId);
        SortOrderSupport.reindex(remaining, TaskList::changeSortOrder);
        taskListRepository.saveAll(remaining);
    }
}
