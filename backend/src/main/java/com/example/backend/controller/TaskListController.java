package com.example.backend.controller;

import com.example.backend.dto.TaskListCreateRequest;
import com.example.backend.dto.TaskListResponse;
import com.example.backend.service.TaskListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TaskListController {

    private final TaskListService taskListService;

    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    @PostMapping("/lists")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskListResponse createList(@Valid @RequestBody TaskListCreateRequest request) {
        return taskListService.createList(request);
    }

    @DeleteMapping("/lists/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long listId) {
        taskListService.deleteList(listId);
    }
}
