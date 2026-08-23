package com.example.backend.repository;

import com.example.backend.entity.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {

    List<TaskList> findByBoardIdOrderBySortOrderAsc(Long boardId);
}
