package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "card")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private TaskList list;

    @Column(nullable = false)
    private String title;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected Card() {
    }

    public Card(TaskList list, String title, LocalDate dueDate, Priority priority, int sortOrder) {
        this.list = list;
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
        this.sortOrder = sortOrder;
    }

    public Long getId() {
        return id;
    }

    public TaskList getList() {
        return list;
    }

    public String getTitle() {
        return title;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void update(String title, LocalDate dueDate, Priority priority) {
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
    }

    public void moveTo(TaskList list, int sortOrder) {
        this.list = list;
        this.sortOrder = sortOrder;
    }
}
