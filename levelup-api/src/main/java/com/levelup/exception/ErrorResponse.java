package com.levelup.exception;

public record ErrorResponse(String errorCode, int status, String message) {}
