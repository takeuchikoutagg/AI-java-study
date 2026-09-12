package com.example.backend.service;

import java.util.List;
import java.util.function.BiConsumer;

final class SortOrderSupport {

    private SortOrderSupport() {
    }

    static <T> void reindex(List<T> items, BiConsumer<T, Integer> sortOrderSetter) {
        for (int i = 0; i < items.size(); i++) {
            sortOrderSetter.accept(items.get(i), i);
        }
    }
}
