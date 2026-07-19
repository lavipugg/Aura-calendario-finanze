package com.finance.service.impl;

import com.finance.dto.DailyNoteDto;
import com.finance.dto.TransactionDto;
import com.finance.entity.DailyNote;
import com.finance.entity.Transaction;
import com.finance.entity.User;
import com.finance.repository.DailyNoteRepository;
import com.finance.repository.TransactionRepository;
import com.finance.repository.UserRepository;
import com.finance.service.FinanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class FinanceServiceImpl implements FinanceService {

    private final UserRepository userRepository;
    private final DailyNoteRepository dailyNoteRepository;
    private final TransactionRepository transactionRepository;

    public FinanceServiceImpl(UserRepository userRepository, 
                              DailyNoteRepository dailyNoteRepository, 
                              TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.dailyNoteRepository = dailyNoteRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public DailyNoteDto getOrCreateDailyNote(Long userId, LocalDate date) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Utente non trovato"));
            
        DailyNote note = dailyNoteRepository.findByUserIdAndDate(userId, date)
            .orElseGet(() -> {
                DailyNote newNote = new DailyNote();
                newNote.setUser(user);
                newNote.setDate(date);
                newNote.setNotes("");
                return dailyNoteRepository.save(newNote);
            });
            
        List<TransactionDto> transactions = transactionRepository.findAllByUserId(userId)
            .stream()
            .filter(t -> t.getDate().equals(date))
            .map(t -> new TransactionDto(t.getId(), t.getDate(), t.getAmount(), t.getType(), t.getMethod(), t.getCategory(), t.getNotes()))
            .toList();
            
        return new DailyNoteDto(note.getId(), note.getDate(), note.getNotes(), transactions);
    }

    @Override
    public DailyNoteDto saveDailyNote(Long userId, LocalDate date, String content) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Utente non trovato"));
            
        DailyNote note = dailyNoteRepository.findByUserIdAndDate(userId, date)
            .orElseGet(() -> {
                DailyNote newNote = new DailyNote();
                newNote.setUser(user);
                newNote.setDate(date);
                return newNote;
            });
            
        note.setNotes(content);
        DailyNote saved = dailyNoteRepository.save(note);
        
        List<TransactionDto> transactions = transactionRepository.findAllByUserId(userId)
            .stream()
            .filter(t -> t.getDate().equals(date))
            .map(t -> new TransactionDto(t.getId(), t.getDate(), t.getAmount(), t.getType(), t.getMethod(), t.getCategory(), t.getNotes()))
            .toList();
            
        return new DailyNoteDto(saved.getId(), saved.getDate(), saved.getNotes(), transactions);
    }

    @Override
    public TransactionDto addTransaction(Long userId, TransactionDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Utente non trovato"));
            
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setDate(dto.date());
        tx.setAmount(dto.amount());
        tx.setType(dto.type());
        tx.setMethod(dto.method());
        tx.setCategory(dto.category());
        tx.setNotes(dto.notes());
        
        Transaction saved = transactionRepository.save(tx);
        return new TransactionDto(saved.getId(), saved.getDate(), saved.getAmount(), saved.getType(), saved.getMethod(), saved.getCategory(), saved.getNotes());
    }

    @Override
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transazione non trovata"));
        if (!tx.getUser().getId().equals(userId)) {
            throw new SecurityException("Operazione non autorizzata");
        }
        transactionRepository.delete(tx);
    }

    @Override
    public List<TransactionDto> getAllTransactions(Long userId) {
        return transactionRepository.findAllByUserId(userId)
            .stream()
            .map(t -> new TransactionDto(t.getId(), t.getDate(), t.getAmount(), t.getType(), t.getMethod(), t.getCategory(), t.getNotes()))
            .toList();
    }
}