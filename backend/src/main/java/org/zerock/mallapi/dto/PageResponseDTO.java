package org.zerock.mallapi.dto;

import java.util.List;
import java.util.stream.IntStream;

import lombok.Builder;
import lombok.Getter;

@Getter
public class PageResponseDTO<E> {

    private final List<E> dtoList;
    private final List<Integer> pageNumList;
    private final PageRequestDTO pageRequestDTO;
    private final boolean prev;
    private final boolean next;
    private final long totalCount;
    private final int prevPage;
    private final int nextPage;
    private final int totalPage;
    private final int current;

    @Builder(builderMethodName = "withAll")
    public PageResponseDTO(List<E> dtoList, PageRequestDTO pageRequestDTO, long totalCount) {
        this.dtoList = dtoList;
        this.pageRequestDTO = pageRequestDTO;
        this.totalCount = totalCount;
        this.current = pageRequestDTO.getPage();

        int start = ((current - 1) / 10) * 10 + 1;
        int last = (int) Math.ceil(totalCount / (double) pageRequestDTO.getSize());
        int end = (int) Math.min((long) start + 9, last);

        this.pageNumList = IntStream.rangeClosed(start, end).boxed().toList();
        this.prev = start > 1 && last > 0;
        this.next = end < last;
        this.prevPage = prev ? Math.min(start - 1, last) : 0;
        this.nextPage = next ? end + 1 : 0;
        this.totalPage = pageNumList.size();
    }
}
