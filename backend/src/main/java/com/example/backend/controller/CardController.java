package com.example.backend.controller;

import com.example.backend.dto.CardCreateRequest;
import com.example.backend.dto.CardResponse;
import com.example.backend.dto.CardUpdateRequest;
import com.example.backend.entity.Card;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.CardRepository;
import com.example.backend.repository.TaskListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class CardController {

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public CardController(TaskListRepository taskListRepository, CardRepository cardRepository) {
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    @PostMapping("/api/lists/{listId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse createCard(@PathVariable Long listId, @RequestBody CardCreateRequest request) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }

        int nextSortOrder = cardRepository.findByListIdOrderBySortOrderAsc(listId).size();
        Card card = new Card(list, request.title(), request.dueDate(), request.priority(), nextSortOrder);
        Card saved = cardRepository.save(card);

        return CardResponse.from(saved);
    }

    @PutMapping("/api/cards/{cardId}")
    public CardResponse updateCard(@PathVariable Long cardId, @RequestBody CardUpdateRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }

        card.update(request.title(), request.dueDate(), request.priority());
        Card saved = cardRepository.save(card);

        return CardResponse.from(saved);
    }
}
