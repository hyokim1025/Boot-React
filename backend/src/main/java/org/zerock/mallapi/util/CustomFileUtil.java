package org.zerock.mallapi.util;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Component
@Slf4j
public class CustomFileUtil {

    private static final long MAX_IMAGE_PIXELS = 24_000_000;
    private static final Pattern FILE_NAME = Pattern.compile(
            "(?:s_)?[a-f0-9-]{36}_[\\p{L}\\p{N}_-]+\\.(?:jpg|png|gif)");
    private final Path uploadPath;

    public CustomFileUtil(@Value("${org.zerock.upload.path}") String uploadPath) throws IOException {
        this.uploadPath = Files.createDirectories(Path.of(uploadPath)).toRealPath();
    }

    public List<String> saveFiles(List<MultipartFile> files) {
        List<String> savedNames = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    saveFile(file, savedNames);
                }
            }
            return savedNames;
        } catch (IOException failure) {
            deleteFiles(savedNames);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store product images", failure);
        } catch (RuntimeException failure) {
            deleteFiles(savedNames);
            throw failure;
        }
    }

    private void saveFile(MultipartFile file, List<String> savedNames) throws IOException {
        try (var stream = file.getInputStream(); ImageInputStream imageStream = ImageIO.createImageInputStream(stream)) {
            if (imageStream == null) {
                throw invalidImage();
            }
            var readers = ImageIO.getImageReaders(imageStream);
            if (!readers.hasNext()) {
                throw invalidImage();
            }

            ImageReader reader = readers.next();
            String extension;
            BufferedImage image;
            try {
                reader.setInput(imageStream);
                extension = switch (reader.getFormatName().toLowerCase(Locale.ROOT)) {
                    case "jpeg", "jpg" -> "jpg";
                    case "png" -> "png";
                    case "gif" -> "gif";
                    default -> throw invalidImage();
                };
                if ((long) reader.getWidth(0) * reader.getHeight(0) > MAX_IMAGE_PIXELS) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product image dimensions are too large");
                }
                image = reader.read(0);
            } catch (IOException failure) {
                throw invalidImage();
            } finally {
                reader.dispose();
            }

            String fileName = UUID.randomUUID() + "_" + safeStem(file.getOriginalFilename()) + "." + extension;
            savedNames.add(fileName);
            try (var original = file.getInputStream()) {
                Files.copy(original, uploadPath.resolve(fileName));
            }
            Thumbnails.of(image)
                    .size(400, 400)
                    .outputFormat(extension)
                    .toFile(uploadPath.resolve("s_" + fileName).toFile());
        }
    }

    private static String safeStem(String original) {
        if (original == null || original.isBlank()) {
            return "image";
        }
        String name = original.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1);
        String stem = name.replaceFirst("\\.[^.]*$", "").replaceAll("[^\\p{L}\\p{N}_-]", "_");
        if (stem.isBlank()) {
            return "image";
        }
        return stem.substring(0, stem.offsetByCodePoints(0, Math.min(stem.codePointCount(0, stem.length()), 60)));
    }

    private static ResponseStatusException invalidImage() {
        return new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Select a valid JPG, PNG, or GIF image");
    }

    public ResponseEntity<Resource> getFile(String fileName) {
        if (!FILE_NAME.matcher(fileName).matches()) {
            return ResponseEntity.notFound().build();
        }
        Path path = uploadPath.resolve(fileName);
        if (!Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)) {
            return ResponseEntity.notFound().build();
        }
        MediaType contentType = fileName.endsWith(".png") ? MediaType.IMAGE_PNG
                : fileName.endsWith(".gif") ? MediaType.IMAGE_GIF : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(contentType)
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(path));
    }

    public void deleteFiles(List<String> fileNames) {
        for (String fileName : fileNames) {
            if (FILE_NAME.matcher(fileName).matches()) {
                deleteFile(fileName);
                deleteFile("s_" + fileName);
            }
        }
    }

    private void deleteFile(String fileName) {
        try {
            Files.deleteIfExists(uploadPath.resolve(fileName));
        } catch (IOException failure) {
            log.warn("Could not delete product image {}", fileName, failure);
        }
    }
}
