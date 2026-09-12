package com.example.backend.controller;

import com.example.backend.dto.CardCreateRequest;
import com.example.backend.dto.CardMoveRequest;
import com.example.backend.dto.CardResponse;
import com.example.backend.service.CardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CardController.class)
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CardService cardService;

    @Test
    void createCard_blankTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/lists/1/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CardCreateRequest("", null, null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCard_validRequest_delegatesToServiceAndReturns201() throws Exception {
        CardCreateRequest request = new CardCreateRequest("新しいタスク", null, null);
        when(cardService.createCard(anyLong(), any(CardCreateRequest.class)))
                .thenReturn(new CardResponse(1L, "新しいタスク", null, null, 0));

        mockMvc.perform(post("/api/lists/1/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        verify(cardService).createCard(1L, request);
    }

    @Test
    void moveCard_missingListId_returns400() throws Exception {
        String body = "{\"position\":0}";

        mockMvc.perform(patch("/api/cards/1/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void moveCard_validRequest_delegatesToService() throws Exception {
        when(cardService.moveCard(anyLong(), any(CardMoveRequest.class)))
                .thenReturn(new CardResponse(1L, "タスク", null, null, 0));

        mockMvc.perform(patch("/api/cards/1/position")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CardMoveRequest(2L, 0))))
                .andExpect(status().isOk());

        verify(cardService).moveCard(1L, new CardMoveRequest(2L, 0));
    }

    @Test
    void deleteCard_delegatesToServiceAndReturns204() throws Exception {
        mockMvc.perform(delete("/api/cards/1"))
                .andExpect(status().isNoContent());

        verify(cardService).deleteCard(1L);
    }
}
