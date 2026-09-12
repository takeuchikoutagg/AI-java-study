package com.example.backend.controller;

import com.example.backend.dto.BoardResponse;
import com.example.backend.dto.TaskListResponse;
import com.example.backend.service.BoardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BoardController.class)
class BoardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BoardService boardService;

    @Test
    void getBoard_returnsBoardJson() throws Exception {
        when(boardService.getBoard()).thenReturn(
                new BoardResponse(1L, "マイボード", List.of(
                        new TaskListResponse(10L, "未着手", 0, List.of()))));

        mockMvc.perform(get("/api/board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("マイボード"))
                .andExpect(jsonPath("$.lists[0].name").value("未着手"));
    }

    @Test
    void getBoard_notFound_returns404() throws Exception {
        when(boardService.getBoard())
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        mockMvc.perform(get("/api/board"))
                .andExpect(status().isNotFound());
    }
}
