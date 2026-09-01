package com.example.backend.controller;

import com.example.backend.dto.CardCreateRequest;
import com.example.backend.dto.CardMoveRequest;
import com.example.backend.dto.CardResponse;
import com.example.backend.dto.CardUpdateRequest;
import com.example.backend.entity.Card;
import com.example.backend.entity.Priority;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.CardRepository;
import com.example.backend.repository.TaskListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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

    @PatchMapping("/api/cards/{cardId}/position")
    public CardResponse moveCard(@PathVariable Long cardId, @RequestBody CardMoveRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        if (request.listId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "listId is required");
        }
        TaskList destinationList = taskListRepository.findById(request.listId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        Long sourceListId = card.getList().getId();
        boolean sameList = sourceListId.equals(destinationList.getId());

        List<Card> destinationCards = cardRepository
                .findByListIdOrderBySortOrderAsc(destinationList.getId()).stream()
                .filter(c -> !c.getId().equals(cardId))
                .collect(Collectors.toCollection(ArrayList::new));

        int position = Math.max(0, Math.min(request.position(), destinationCards.size()));
        destinationCards.add(position, card);

        for (int i = 0; i < destinationCards.size(); i++) {
            destinationCards.get(i).moveTo(destinationList, i);
        }
        cardRepository.saveAll(destinationCards);

        if (!sameList) {
            List<Card> sourceCards = cardRepository.findByListIdOrderBySortOrderAsc(sourceListId);
            for (int i = 0; i < sourceCards.size(); i++) {
                sourceCards.get(i).moveTo(sourceCards.get(i).getList(), i);
            }
            cardRepository.saveAll(sourceCards);
        }

        return CardResponse.from(card);
    }

    @PatchMapping("/api/lists/{listId}/cards/sort-by-priority")
    public List<CardResponse> sortByPriority(@PathVariable Long listId) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        List<Card> sorted = cardRepository.findByListIdOrderBySortOrderAsc(listId).stream()
                .sorted(Comparator.comparingInt(card -> priorityRank(card.getPriority())))
                .toList();

        for (int i = 0; i < sorted.size(); i++) {
            sorted.get(i).moveTo(list, i);
        }
        cardRepository.saveAll(sorted);

        return sorted.stream().map(CardResponse::from).toList();
    }

    private int priorityRank(Priority priority) {
        if (priority == null) {
            return 3;
        }
        return switch (priority) {
            case HIGH -> 0;
            case MEDIUM -> 1;
            case LOW -> 2;
        };
    }
}
