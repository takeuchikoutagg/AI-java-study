package com.example.backend.controller;

import com.example.backend.entity.Card;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.CardRepository;
import com.example.backend.repository.TaskListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class TaskListController {

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public TaskListController(TaskListRepository taskListRepository, CardRepository cardRepository) {
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    @DeleteMapping("/api/lists/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long listId) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        Long boardId = list.getBoard().getId();

        List<Card> cards = cardRepository.findByListIdOrderBySortOrderAsc(listId);
        cardRepository.deleteAll(cards);
        taskListRepository.delete(list);

        List<TaskList> remaining = taskListRepository.findByBoardIdOrderBySortOrderAsc(boardId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).changeSortOrder(i);
        }
        taskListRepository.saveAll(remaining);
    }
}
