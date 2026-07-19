package com.finance.controller;

import com.finance.dto.DailyNoteDto;
import com.finance.dto.TransactionDto;
import com.finance.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/day/{date}")
    public ResponseEntity<DailyNoteDto> getDailyDetails(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("User-Id") Long userId) {
        return ResponseEntity.ok(financeService.getOrCreateDailyNote(userId, date));
    }

    @PostMapping("/day/{date}/note")
    public ResponseEntity<DailyNoteDto> saveDailyNote(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody String content,
            @RequestHeader("User-Id") Long userId) {
        return ResponseEntity.ok(financeService.saveDailyNote(userId, date, content));
    }

    @PostMapping("/transaction")
    public ResponseEntity<TransactionDto> addTransaction(
            @Valid @RequestBody TransactionDto transactionDto,
            @RequestHeader("User-Id") Long userId) {
        return ResponseEntity.ok(financeService.addTransaction(userId, transactionDto));
    }

    @DeleteMapping("/transaction/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        financeService.deleteTransaction(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> getAllTransactions(
            @RequestHeader("User-Id") Long userId) {
        return ResponseEntity.ok(financeService.getAllTransactions(userId));
    }
}