package com.example.backend.service;

import com.example.backend.dto.BoardResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.Card;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CardRepository;
import com.example.backend.repository.TaskListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private TaskListRepository taskListRepository;

    @Mock
    private CardRepository cardRepository;

    private BoardService boardService;

    @BeforeEach
    void setUp() {
        boardService = new BoardService(boardRepository, taskListRepository, cardRepository);
    }

    @Test
    void getBoard_notFound_throws404() {
        when(boardRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> boardService.getBoard())
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void getBoard_fetchesCardsInOneBulkQueryAndGroupsByList() {
        Board board = new Board("マイボード");
        setId(board, 1L);

        TaskList listA = new TaskList(board, "未着手", 0);
        setId(listA, 10L);
        TaskList listB = new TaskList(board, "作業中", 1);
        setId(listB, 20L);

        Card cardA = new Card(listA, "A", null, null, 0);
        Card cardB = new Card(listB, "B", null, null, 0);

        when(boardRepository.findAll()).thenReturn(List.of(board));
        when(taskListRepository.findByBoardIdOrderBySortOrderAsc(1L)).thenReturn(List.of(listA, listB));
        when(cardRepository.findByListIdInOrderBySortOrderAsc(List.of(10L, 20L)))
                .thenReturn(List.of(cardA, cardB));

        BoardResponse response = boardService.getBoard();

        assertThat(response.lists()).hasSize(2);
        assertThat(response.lists().get(0).cards()).extracting("title").containsExactly("A");
        assertThat(response.lists().get(1).cards()).extracting("title").containsExactly("B");
        verify(cardRepository, times(1)).findByListIdInOrderBySortOrderAsc(anyList());
    }

    @Test
    void getBoard_listWithNoCards_returnsEmptyCardList() {
        Board board = new Board("マイボード");
        setId(board, 1L);
        TaskList emptyList = new TaskList(board, "完了", 0);
        setId(emptyList, 30L);

        when(boardRepository.findAll()).thenReturn(List.of(board));
        when(taskListRepository.findByBoardIdOrderBySortOrderAsc(1L)).thenReturn(List.of(emptyList));
        when(cardRepository.findByListIdInOrderBySortOrderAsc(List.of(30L))).thenReturn(List.of());

        BoardResponse response = boardService.getBoard();

        assertThat(response.lists()).hasSize(1);
        assertThat(response.lists().get(0).cards()).isEmpty();
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
