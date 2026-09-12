package com.example.backend.controller;

import com.example.backend.dto.TaskListCreateRequest;
import com.example.backend.dto.TaskListResponse;
import com.example.backend.service.TaskListService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskListController.class)
class TaskListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TaskListService taskListService;

    @Test
    void createList_blankName_returns400() throws Exception {
        mockMvc.perform(post("/api/lists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TaskListCreateRequest(""))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createList_validRequest_delegatesToServiceAndReturns201() throws Exception {
        TaskListCreateRequest request = new TaskListCreateRequest("レビュー中");
        when(taskListService.createList(any(TaskListCreateRequest.class)))
                .thenReturn(new TaskListResponse(1L, "レビュー中", 3, List.of()));

        mockMvc.perform(post("/api/lists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        verify(taskListService).createList(request);
    }

    @Test
    void deleteList_delegatesToServiceAndReturns204() throws Exception {
        mockMvc.perform(delete("/api/lists/1"))
                .andExpect(status().isNoContent());

        verify(taskListService).deleteList(1L);
    }

    @Test
    void deleteList_notFound_returns404() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"))
                .when(taskListService).deleteList(999L);

        mockMvc.perform(delete("/api/lists/999"))
                .andExpect(status().isNotFound());
    }
}
