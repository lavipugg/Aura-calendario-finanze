package com.finance.dto;

import com.finance.enums.Category;
import com.finance.enums.PaymentMethod;
import com.finance.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionDto(
    Long id,
    LocalDate date,
    BigDecimal amount,
    TransactionType type,
    PaymentMethod method,
    Category category,
    String notes
) {}