package com.example.backend.service;

import com.example.backend.dto.CardCreateRequest;
import com.example.backend.dto.CardMoveRequest;
import com.example.backend.dto.CardResponse;
import com.example.backend.dto.CardUpdateRequest;
import com.example.backend.entity.Board;
import com.example.backend.entity.Card;
import com.example.backend.entity.Priority;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.CardRepository;
import com.example.backend.repository.TaskListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private TaskListRepository taskListRepository;

    @Mock
    private CardRepository cardRepository;

    private CardService cardService;

    private Board board;
    private TaskList listA;
    private TaskList listB;

    @BeforeEach
    void setUp() {
        cardService = new CardService(taskListRepository, cardRepository);
        board = new Board("マイボード");
        listA = new TaskList(board, "未着手", 0);
        setId(listA, 1L);
        listB = new TaskList(board, "作業中", 1);
        setId(listB, 2L);
    }

    @Test
    void createCard_usesCountByListIdForNextSortOrder() {
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(listA));
        when(cardRepository.countByListId(1L)).thenReturn(2);
        when(cardRepository.save(any(Card.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CardResponse response = cardService.createCard(1L, new CardCreateRequest("新しいタスク", null, null));

        assertThat(response.sortOrder()).isEqualTo(2);
        verify(cardRepository).countByListId(1L);
    }

    @Test
    void createCard_listNotFound_throws404() {
        when(taskListRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.createCard(999L, new CardCreateRequest("タイトル", null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void updateCard_updatesFieldsAndReturnsResponse() {
        Card card = newCard(listA, "元のタイトル", null, 0);
        setId(card, 10L);

        when(cardRepository.findById(10L)).thenReturn(Optional.of(card));
        when(cardRepository.save(card)).thenReturn(card);

        CardResponse response = cardService.updateCard(
                10L, new CardUpdateRequest("新しいタイトル", null, Priority.HIGH));

        assertThat(response.title()).isEqualTo("新しいタイトル");
        assertThat(response.priority()).isEqualTo(Priority.HIGH);
    }

    @Test
    void updateCard_notFound_throws404() {
        when(cardRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.updateCard(999L, new CardUpdateRequest("タイトル", null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void moveCard_sameList_reindexesContiguously() {
        Card cardA = newCard(listA, "A", null, 0);
        Card cardB = newCard(listA, "B", null, 1);
        Card cardC = newCard(listA, "C", null, 2);
        setId(cardA, 10L);
        setId(cardB, 11L);
        setId(cardC, 12L);

        when(cardRepository.findById(12L)).thenReturn(Optional.of(cardC));
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(listA));
        when(cardRepository.findByListIdOrderBySortOrderAsc(1L)).thenReturn(List.of(cardA, cardB, cardC));

        cardService.moveCard(12L, new CardMoveRequest(1L, 0));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Card>> captor = ArgumentCaptor.forClass(List.class);
        verify(cardRepository).saveAll(captor.capture());

        List<Card> saved = captor.getValue();
        assertThat(saved).containsExactly(cardC, cardA, cardB);
        assertThat(saved.get(0).getSortOrder()).isEqualTo(0);
        assertThat(saved.get(1).getSortOrder()).isEqualTo(1);
        assertThat(saved.get(2).getSortOrder()).isEqualTo(2);
    }

    @Test
    void moveCard_crossList_reindexesBothSourceAndDestination() {
        Card cardA = newCard(listA, "A", null, 0);
        Card cardB = newCard(listA, "B", null, 1);
        Card cardX = newCard(listB, "X", null, 0);
        setId(cardA, 10L);
        setId(cardB, 11L);
        setId(cardX, 20L);

        when(cardRepository.findById(11L)).thenReturn(Optional.of(cardB));
        when(taskListRepository.findById(2L)).thenReturn(Optional.of(listB));
        when(cardRepository.findByListIdOrderBySortOrderAsc(2L)).thenReturn(new ArrayList<>(List.of(cardX)));
        when(cardRepository.findByListIdOrderBySortOrderAsc(1L)).thenReturn(List.of(cardA));

        cardService.moveCard(11L, new CardMoveRequest(2L, 1));

        assertThat(cardB.getList()).isSameAs(listB);
        assertThat(cardB.getSortOrder()).isEqualTo(1);
        assertThat(cardA.getSortOrder()).isEqualTo(0);

        verify(cardRepository).saveAll(List.of(cardX, cardB));
        verify(cardRepository).saveAll(List.of(cardA));
    }

    @Test
    void moveCard_positionClampedToValidRange() {
        Card cardA = newCard(listA, "A", null, 0);
        setId(cardA, 10L);

        when(cardRepository.findById(10L)).thenReturn(Optional.of(cardA));
        when(taskListRepository.findById(1L)).thenReturn(Optional.of(listA));
        when(cardRepository.findByListIdOrderBySortOrderAsc(1L)).thenReturn(List.of(cardA));

        cardService.moveCard(10L, new CardMoveRequest(1L, 999));

        assertThat(cardA.getSortOrder()).isEqualTo(0);
    }

    @Test
    void deleteCard_removesCardAndReindexesRemaining() {
        Card cardA = newCard(listA, "A", null, 0);
        Card cardB = newCard(listA, "B", null, 1);
        Card cardC = newCard(listA, "C", null, 2);
        setId(cardA, 10L);
        setId(cardB, 11L);
        setId(cardC, 12L);

        when(cardRepository.findById(11L)).thenReturn(Optional.of(cardB));
        when(cardRepository.findByListIdOrderBySortOrderAsc(1L)).thenReturn(List.of(cardA, cardC));

        cardService.deleteCard(11L);

        verify(cardRepository).delete(cardB);
        assertThat(cardA.getSortOrder()).isEqualTo(0);
        assertThat(cardC.getSortOrder()).isEqualTo(1);
        verify(cardRepository).saveAll(List.of(cardA, cardC));
    }

    @Test
    void sortByPriority_ordersHighMediumLowThenUnset() {
        Card unset = newCard(listA, "未設定", null, 0);
        Card low = newCard(listA, "低", Priority.LOW, 1);
        Card high = newCard(listA, "高", Priority.HIGH, 2);
        Card medium = newCard(listA, "中", Priority.MEDIUM, 3);

        when(taskListRepository.findById(1L)).thenReturn(Optional.of(listA));
        when(cardRepository.findByListIdOrderBySortOrderAsc(1L))
                .thenReturn(List.of(unset, low, high, medium));

        List<CardResponse> result = cardService.sortByPriority(1L);

        assertThat(result).extracting(CardResponse::title)
                .containsExactly("高", "中", "低", "未設定");
        assertThat(result).extracting(CardResponse::sortOrder)
                .containsExactly(0, 1, 2, 3);
    }

    private Card newCard(TaskList list, String title, Priority priority, int sortOrder) {
        return new Card(list, title, null, priority, sortOrder);
    }

    private void setId(Object entity, Long id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
