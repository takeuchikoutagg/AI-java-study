package com.example.backend.controller;

import com.example.backend.dto.CardCreateRequest;
import com.example.backend.dto.CardMoveRequest;
import com.example.backend.dto.CardResponse;
import com.example.backend.dto.CardUpdateRequest;
import com.example.backend.service.CardService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping("/lists/{listId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse createCard(@PathVariable Long listId, @RequestBody CardCreateRequest request) {
        return cardService.createCard(listId, request);
    }

    @PutMapping("/cards/{cardId}")
    public CardResponse updateCard(@PathVariable Long cardId, @RequestBody CardUpdateRequest request) {
        return cardService.updateCard(cardId, request);
    }

    @PatchMapping("/cards/{cardId}/position")
    public CardResponse moveCard(@PathVariable Long cardId, @RequestBody CardMoveRequest request) {
        return cardService.moveCard(cardId, request);
    }

    @DeleteMapping("/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable Long cardId) {
        cardService.deleteCard(cardId);
    }

    @PatchMapping("/lists/{listId}/cards/sort-by-priority")
    public List<CardResponse> sortByPriority(@PathVariable Long listId) {
        return cardService.sortByPriority(listId);
    }
}
