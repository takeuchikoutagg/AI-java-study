-- 初期データ投入。アプリ起動のたびに実行されるため、WHERE NOT EXISTSで再登録を防ぐ。

INSERT INTO board (name)
SELECT 'マイボード'
WHERE NOT EXISTS (
    SELECT 1 FROM board WHERE name = 'マイボード'
);

INSERT INTO task_list (board_id, name, sort_order)
SELECT b.id, '未着手', 0
FROM board b
WHERE b.name = 'マイボード'
  AND NOT EXISTS (
    SELECT 1 FROM task_list tl WHERE tl.board_id = b.id AND tl.name = '未着手'
);

INSERT INTO task_list (board_id, name, sort_order)
SELECT b.id, '作業中', 1
FROM board b
WHERE b.name = 'マイボード'
  AND NOT EXISTS (
    SELECT 1 FROM task_list tl WHERE tl.board_id = b.id AND tl.name = '作業中'
);

INSERT INTO task_list (board_id, name, sort_order)
SELECT b.id, '完了', 2
FROM board b
WHERE b.name = 'マイボード'
  AND NOT EXISTS (
    SELECT 1 FROM task_list tl WHERE tl.board_id = b.id AND tl.name = '完了'
);

INSERT INTO card (list_id, title, due_date, priority, sort_order)
SELECT tl.id, '要件定義を書く', NULL, 'HIGH', 0
FROM task_list tl JOIN board b ON tl.board_id = b.id
WHERE b.name = 'マイボード' AND tl.name = '未着手'
  AND NOT EXISTS (
    SELECT 1 FROM card c JOIN task_list tl2 ON c.list_id = tl2.id
    WHERE tl2.board_id = b.id AND c.title = '要件定義を書く'
);

INSERT INTO card (list_id, title, due_date, priority, sort_order)
SELECT tl.id, '画面デザインを検討する', DATE '2026-09-01', 'MEDIUM', 1
FROM task_list tl JOIN board b ON tl.board_id = b.id
WHERE b.name = 'マイボード' AND tl.name = '未着手'
  AND NOT EXISTS (
    SELECT 1 FROM card c JOIN task_list tl2 ON c.list_id = tl2.id
    WHERE tl2.board_id = b.id AND c.title = '画面デザインを検討する'
);

INSERT INTO card (list_id, title, due_date, priority, sort_order)
SELECT tl.id, '参考アプリを調査する', NULL, NULL, 2
FROM task_list tl JOIN board b ON tl.board_id = b.id
WHERE b.name = 'マイボード' AND tl.name = '未着手'
  AND NOT EXISTS (
    SELECT 1 FROM card c JOIN task_list tl2 ON c.list_id = tl2.id
    WHERE tl2.board_id = b.id AND c.title = '参考アプリを調査する'
);

INSERT INTO card (list_id, title, due_date, priority, sort_order)
SELECT tl.id, 'バックエンドAPIを実装する', DATE '2026-08-25', 'HIGH', 0
FROM task_list tl JOIN board b ON tl.board_id = b.id
WHERE b.name = 'マイボード' AND tl.name = '作業中'
  AND NOT EXISTS (
    SELECT 1 FROM card c JOIN task_list tl2 ON c.list_id = tl2.id
    WHERE tl2.board_id = b.id AND c.title = 'バックエンドAPIを実装する'
);

INSERT INTO card (list_id, title, due_date, priority, sort_order)
SELECT tl.id, 'DB接続設定を行う', NULL, 'LOW', 1
FROM task_list tl JOIN board b ON tl.board_id = b.id
WHERE b.name = 'マイボード' AND tl.name = '作業中'
  AND NOT EXISTS (
    SELECT 1 FROM card c JOIN task_list tl2 ON c.list_id = tl2.id
    WHERE tl2.board_id = b.id AND c.title = 'DB接続設定を行う'
);

INSERT INTO card (list_id, title, due_date, priority, sort_order)
SELECT tl.id, 'プロジェクト初期セットアップ', NULL, NULL, 0
FROM task_list tl JOIN board b ON tl.board_id = b.id
WHERE b.name = 'マイボード' AND tl.name = '完了'
  AND NOT EXISTS (
    SELECT 1 FROM card c JOIN task_list tl2 ON c.list_id = tl2.id
    WHERE tl2.board_id = b.id AND c.title = 'プロジェクト初期セットアップ'
);
