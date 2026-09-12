package com.example.backend.service;

import com.example.backend.entity.TaskList;
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

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public TaskListService(TaskListRepository taskListRepository, CardRepository cardRepository) {
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    public void deleteList(Long listId) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        Long boardId = list.getBoard().getId();

        cardRepository.deleteAll(cardRepository.findByListIdOrderBySortOrderAsc(listId));
        taskListRepository.delete(list);

        List<TaskList> remaining = taskListRepository.findByBoardIdOrderBySortOrderAsc(boardId);
        SortOrderSupport.reindex(remaining, TaskList::changeSortOrder);
        taskListRepository.saveAll(remaining);
    }
}
