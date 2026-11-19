package org.zerock.mallapi.service;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import org.zerock.mallapi.domain.Product;
import org.zerock.mallapi.domain.ProductImage;
import org.zerock.mallapi.dto.PageRequestDTO;
import org.zerock.mallapi.dto.PageResponseDTO;
import org.zerock.mallapi.dto.ProductDTO;
import org.zerock.mallapi.repository.ProductRepository;
import org.zerock.mallapi.util.CustomFileUtil;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CustomFileUtil fileUtil;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ProductDTO> getList(PageRequestDTO request) {
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(),
                Sort.by("pno").descending());
        Page<ProductDTO> page = productRepository.selectList(pageable).map(row -> {
            String fileName = (String) row[1];
            return toDTO((Product) row[0], fileName == null ? List.of() : List.of(fileName));
        });

        return PageResponseDTO.<ProductDTO>withAll()
                .dtoList(page.getContent())
                .pageRequestDTO(request)
                .totalCount(page.getTotalElements())
                .build();
    }

    @Override
    public Long register(ProductDTO dto) {
        List<String> newFiles = fileUtil.saveFiles(dto.getFiles());
        scheduleCleanup(newFiles, List.of());

        Product product = Product.builder()
                .pname(dto.getPname())
                .price(dto.getPrice())
                .pdesc(dto.getPdesc())
                .build();
        product.replaceImages(newFiles);
        return productRepository.save(product).getPno();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO get(Long pno) {
        Product product = productRepository.selectOne(pno).orElseThrow(() -> notFound(pno));
        return toDTO(product, fileNames(product));
    }

    @Override
    public void modify(ProductDTO dto) {
        Product product = productRepository.findByPnoAndDelFlagFalse(dto.getPno())
                .orElseThrow(() -> notFound(dto.getPno()));
        List<String> oldFiles = fileNames(product);
        List<String> retained = dto.getUploadFileNames().stream().distinct().toList();
        if (!oldFiles.containsAll(retained)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product image selection");
        }

        List<String> newFiles = fileUtil.saveFiles(dto.getFiles());
        List<String> removed = oldFiles.stream().filter(file -> !retained.contains(file)).toList();
        scheduleCleanup(newFiles, removed);

        List<String> replacement = new ArrayList<>(retained);
        replacement.addAll(newFiles);
        product.changeDetails(dto.getPname(), dto.getPrice(), dto.getPdesc());
        product.replaceImages(replacement);
    }

    @Override
    public void remove(Long pno) {
        Product product = productRepository.findByPnoAndDelFlagFalse(pno).orElseThrow(() -> notFound(pno));
        scheduleCleanup(List.of(), fileNames(product));
        product.markDeleted();
    }

    private static List<String> fileNames(Product product) {
        return product.getImageList().stream().map(ProductImage::getFileName).toList();
    }

    private static ProductDTO toDTO(Product product, List<String> fileNames) {
        return ProductDTO.builder()
                .pno(product.getPno())
                .pname(product.getPname())
                .price(product.getPrice())
                .pdesc(product.getPdesc())
                .delFlag(product.isDelFlag())
                .uploadFileNames(fileNames)
                .build();
    }

    private static NoSuchElementException notFound(Long pno) {
        return new NoSuchElementException("Product " + pno + " not found");
    }

    private void scheduleCleanup(List<String> newFiles, List<String> removedFiles) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                fileUtil.deleteFiles(removedFiles);
            }

            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    fileUtil.deleteFiles(newFiles);
                }
            }
        });
    }
}
