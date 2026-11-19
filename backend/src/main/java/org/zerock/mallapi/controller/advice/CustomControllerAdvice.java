package org.zerock.mallapi.controller.advice;

import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.zerock.mallapi.util.CustomJWTException;

@RestControllerAdvice
public class CustomControllerAdvice {

    @ExceptionHandler(CustomJWTException.class)
    public ResponseEntity<Map<String, String>> invalidToken(CustomJWTException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notExist(NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("msg", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalidInput(MethodArgumentNotValidException exception) {
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                .body(Map.of("msg", "Invalid request data"));
    }
}
