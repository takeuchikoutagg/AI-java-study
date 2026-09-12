package com.example.backend.service;

import com.example.backend.entity.Board;
import com.example.backend.entity.TaskList;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskListServiceTest {

    @Mock
    private TaskListRepository taskListRepository;

    @Mock
    private CardRepository cardRepository;

    private TaskListService taskListService;

    private Board board;

    @BeforeEach
    void setUp() {
        taskListService = new TaskListService(taskListRepository, cardRepository);
        board = new Board("マイボード");
        setId(board, 1L);
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
