package com.levelup.controller;

import com.levelup.exception.ConflictException;
import com.levelup.exception.ErrorResponse;
import com.levelup.exception.ForbiddenException;
import com.levelup.exception.InvalidTokenException;
import com.levelup.exception.ResourceNotFoundException;
import com.levelup.exception.ValidationErrorResponse;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
// import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final org.slf4j.Logger logger =
      org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(InvalidTokenException.class)
  public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidTokenException ex) {
    return ResponseEntity.status(401)
        .body(new ErrorResponse("UNAUTHORIZED", 401, ex.getMessage()));
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(404)
        .body(new ErrorResponse("RESOURCE_NOT_FOUND", 404, ex.getMessage()));
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
    return ResponseEntity.status(403)
        .body(
            new ErrorResponse(
                "FORBIDDEN", 403, "You do not have permission to perform this action"));
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
    return ResponseEntity.status(409).body(new ErrorResponse("CONFLICT", 409, ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ValidationErrorResponse> handleValidation(
      MethodArgumentNotValidException ex) {
    Map<String, String> fields = new HashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(err -> fields.put(err.getField(), err.getDefaultMessage()));
    return ResponseEntity.status(400)
        .body(
            new ValidationErrorResponse(
                "VALIDATION_FAILED", 400, "Request body contains invalid fields", fields));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
    return ResponseEntity.status(400).body(new ErrorResponse("BAD_REQUEST", 400, ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
    logger.error("Unhandled exception", ex);
    return ResponseEntity.status(500)
        .body(new ErrorResponse("INTERNAL_SERVER_ERROR", 500, "An unexpected error occurred"));
  }
}
