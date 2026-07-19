package com.finance.service;

import com.finance.dto.DailyNoteDto;
import com.finance.dto.TransactionDto;
import java.time.LocalDate;
import java.util.List;

public interface FinanceService {
    DailyNoteDto getOrCreateDailyNote(Long userId, LocalDate date);
    DailyNoteDto saveDailyNote(Long userId, LocalDate date, String content);
    TransactionDto addTransaction(Long userId, TransactionDto transactionDto);
    void deleteTransaction(Long userId, Long transactionId);
    List<TransactionDto> getAllTransactions(Long userId);
}