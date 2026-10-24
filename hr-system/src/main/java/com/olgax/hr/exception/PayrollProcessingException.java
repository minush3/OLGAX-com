package com.olgax.hr.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PayrollProcessingException extends RuntimeException {
    public PayrollProcessingException(String message) {
        super(message);
    }

    public PayrollProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
