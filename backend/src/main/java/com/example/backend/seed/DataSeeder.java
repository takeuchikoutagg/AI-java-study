package com.example.backend.seed;

import com.example.backend.entity.Board;
import com.example.backend.entity.Card;
import com.example.backend.entity.Priority;
import com.example.backend.entity.TaskList;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.CardRepository;
import com.example.backend.repository.TaskListRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private final BoardRepository boardRepository;
    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public DataSeeder(
            BoardRepository boardRepository,
            TaskListRepository taskListRepository,
            CardRepository cardRepository
    ) {
        this.boardRepository = boardRepository;
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    @Override
    public void run(String... args) {
        if (boardRepository.count() > 0) {
            return;
        }

        Board board = boardRepository.save(new Board("マイボード"));

        TaskList todo = taskListRepository.save(new TaskList(board, "未着手", 0));
        TaskList doing = taskListRepository.save(new TaskList(board, "作業中", 1));
        TaskList done = taskListRepository.save(new TaskList(board, "完了", 2));

        cardRepository.save(new Card(todo, "要件定義を書く", null, Priority.HIGH, 0));
        cardRepository.save(new Card(todo, "画面デザインを検討する", LocalDate.of(2026, 9, 1), Priority.MEDIUM, 1));
        cardRepository.save(new Card(todo, "参考アプリを調査する", null, null, 2));

        cardRepository.save(new Card(doing, "バックエンドAPIを実装する", LocalDate.of(2026, 8, 25), Priority.HIGH, 0));
        cardRepository.save(new Card(doing, "DB接続設定を行う", null, Priority.LOW, 1));

        cardRepository.save(new Card(done, "プロジェクト初期セットアップ", null, null, 0));
    }
}
