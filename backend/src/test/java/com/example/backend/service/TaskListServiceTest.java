package com.example.backend.service;

import com.example.backend.dto.TaskListCreateRequest;
import com.example.backend.dto.TaskListResponse;
import com.example.backend.entity.Board;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.BoardRepository;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskListServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private TaskListRepository taskListRepository;

    @Mock
    private CardRepository cardRepository;

    private TaskListService taskListService;

    private Board board;

    @BeforeEach
    void setUp() {
        taskListService = new TaskListService(boardRepository, taskListRepository, cardRepository);
        board = new Board("マイボード");
        setId(board, 1L);
    }

    @Test
    void createList_appendsToEndOfBoard() {
        when(boardRepository.findAll()).thenReturn(List.of(board));
        when(taskListRepository.countByBoardId(1L)).thenReturn(3);
        when(taskListRepository.save(any(TaskList.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskListResponse response = taskListService.createList(new TaskListCreateRequest("レビュー中"));

        assertThat(response.name()).isEqualTo("レビュー中");
        assertThat(response.sortOrder()).isEqualTo(3);
        assertThat(response.cards()).isEmpty();

        ArgumentCaptor<TaskList> captor = ArgumentCaptor.forClass(TaskList.class);
        verify(taskListRepository).save(captor.capture());
        assertThat(captor.getValue().getBoard()).isSameAs(board);
    }

    @Test
    void createList_boardNotFound_throws404() {
        when(boardRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> taskListService.createList(new TaskListCreateRequest("レビュー中")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void deleteList_bulkDeletesCardsThenDeletesListThenReindexesRemaining() {
        TaskList target = new TaskList(board, "作業中", 1);
        setId(target, 2L);
        TaskList first = new TaskList(board, "未着手", 0);
        setId(first, 1L);
        TaskList last = new TaskList(board, "完了", 2);
        setId(last, 3L);

        when(taskListRepository.findById(2L)).thenReturn(Optional.of(target));
        when(taskListRepository.findByBoardIdOrderBySortOrderAsc(1L)).thenReturn(List.of(first, last));

        taskListService.deleteList(2L);

        verify(cardRepository).deleteByListId(2L);
        verify(taskListRepository).delete(target);
        assertThat(first.getSortOrder()).isEqualTo(0);
        assertThat(last.getSortOrder()).isEqualTo(1);
        verify(taskListRepository).saveAll(List.of(first, last));
    }

    @Test
    void deleteList_notFound_throws404() {
        when(taskListRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskListService.deleteList(999L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
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
