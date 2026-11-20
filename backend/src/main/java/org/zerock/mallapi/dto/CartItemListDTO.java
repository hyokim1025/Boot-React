package org.zerock.mallapi.dto;

public record CartItemListDTO(Long cino, int qty, Long pno, String pname, int price, String imageFile) {
}
