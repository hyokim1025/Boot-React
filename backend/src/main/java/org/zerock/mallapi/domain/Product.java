package org.zerock.mallapi.domain;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_product")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pno;
    private String pname;
    private int price;
    private String pdesc;
    private boolean delFlag;

    @ElementCollection
    @OrderBy("ord ASC")
    @Builder.Default
    private List<ProductImage> imageList = new ArrayList<>();

    public void changeDetails(String pname, int price, String pdesc) {
        this.pname = pname;
        this.price = price;
        this.pdesc = pdesc;
    }

    public void replaceImages(List<String> fileNames) {
        imageList.clear();
        for (String fileName : fileNames) {
            imageList.add(new ProductImage(fileName, imageList.size()));
        }
    }

    public void markDeleted() {
        delFlag = true;
        imageList.clear();
    }
}
