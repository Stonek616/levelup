package com.levelup.exception;

import java.util.Map;

public record ValidationErrorResponse (
    String errorCode,
    int status,
    String message,
    Map<String, String> fieldErrors
)
{
}
