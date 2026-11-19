package org.zerock.mallapi.controller;

import java.util.Map;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.mallapi.dto.PageRequestDTO;
import org.zerock.mallapi.dto.PageResponseDTO;
import org.zerock.mallapi.dto.ProductDTO;
import org.zerock.mallapi.service.ProductService;
import org.zerock.mallapi.util.CustomFileUtil;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final CustomFileUtil fileUtil;

    @PostMapping(path = {"", "/"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> register(@Valid ProductDTO productDTO) {
        return Map.of("result", productService.register(productDTO));
    }

    @GetMapping("/view/{fileName}")
    public ResponseEntity<Resource> viewFileGET(@PathVariable String fileName) {
        return fileUtil.getFile(fileName);
    }

    @GetMapping("/list")
    public PageResponseDTO<ProductDTO> list(@Valid PageRequestDTO request) {
        return productService.getList(request);
    }

    @GetMapping("/{pno}")
    public ProductDTO read(@PathVariable Long pno) {
        return productService.get(pno);
    }

    @PutMapping(path = "/{pno}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> modify(@PathVariable Long pno, @Valid ProductDTO productDTO) {
        productDTO.setPno(pno);
        productService.modify(productDTO);
        return Map.of("RESULT", "SUCCESS");
    }

    @DeleteMapping("/{pno}")
    public Map<String, String> remove(@PathVariable Long pno) {
        productService.remove(pno);
        return Map.of("RESULT", "SUCCESS");
    }
}
