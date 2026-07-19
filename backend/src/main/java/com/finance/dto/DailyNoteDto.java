package com.finance.dto;

import java.time.LocalDate;
import java.util.List;

public record DailyNoteDto(
    Long id,
    LocalDate date,
    String content,
    List<TransactionDto> transactions
) {}