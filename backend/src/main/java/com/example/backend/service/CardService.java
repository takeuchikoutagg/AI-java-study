package com.example.backend.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CardService {

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public CardService(TaskListRepository taskListRepository, CardRepository cardRepository) {
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    public CardResponse createCard(Long listId, CardCreateRequest request) {
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

    public CardResponse updateCard(Long cardId, CardUpdateRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }

        card.update(request.title(), request.dueDate(), request.priority());
        Card saved = cardRepository.save(card);

        return CardResponse.from(saved);
    }

    public CardResponse moveCard(Long cardId, CardMoveRequest request) {
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

        SortOrderSupport.reindex(destinationCards, (c, i) -> c.moveTo(destinationList, i));
        cardRepository.saveAll(destinationCards);

        if (!sameList) {
            List<Card> sourceCards = cardRepository.findByListIdOrderBySortOrderAsc(sourceListId);
            SortOrderSupport.reindex(sourceCards, (c, i) -> c.moveTo(c.getList(), i));
            cardRepository.saveAll(sourceCards);
        }

        return CardResponse.from(card);
    }

    public void deleteCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        Long listId = card.getList().getId();
        cardRepository.delete(card);

        List<Card> remaining = cardRepository.findByListIdOrderBySortOrderAsc(listId);
        SortOrderSupport.reindex(remaining, (c, i) -> c.moveTo(c.getList(), i));
        cardRepository.saveAll(remaining);
    }

    public List<CardResponse> sortByPriority(Long listId) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));

        List<Card> sorted = cardRepository.findByListIdOrderBySortOrderAsc(listId).stream()
                .sorted(Comparator.comparingInt(card -> priorityRank(card.getPriority())))
                .toList();

        SortOrderSupport.reindex(sorted, (c, i) -> c.moveTo(list, i));
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
