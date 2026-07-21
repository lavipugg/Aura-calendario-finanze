export interface JavaFile {
  name: string;
  path: string;
  language: string;
  code: string;
}

export interface JavaFolder {
  name: string;
  isOpen?: boolean;
  files?: JavaFile[];
  folders?: JavaFolder[];
}

export const javaProjectStructure: JavaFolder = {
  name: "backend",
  isOpen: true,
  files: [
    {
      name: "pom.xml",
      path: "backend/pom.xml",
      language: "xml",
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.4</version>
		<relativePath/>
	</parent>
	<groupId>com</groupId>
	<artifactId>finance</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>finance-scheduler</name>
	<description>Finance Calendar Backend with Java 21</description>
	<properties>
		<java.version>21</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>com.mysql</groupId>
			<artifactId>mysql-connector-j</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>
	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>`
    }
  ],
  folders: [
    {
      name: "src",
      isOpen: true,
      folders: [
        {
          name: "main",
          isOpen: true,
          folders: [
            {
              name: "java",
              isOpen: true,
              folders: [
                {
                  name: "com",
                  isOpen: true,
                  folders: [
                    {
                      name: "finance",
                      isOpen: true,
                      files: [
                        {
                          name: "FinanceApplication.java",
                          path: "backend/src/main/java/com/finance/FinanceApplication.java",
                          language: "java",
                          code: `package com.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FinanceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FinanceApplication.class, args);
    }
}`
                        }
                      ],
                      folders: [
                        {
                          name: "controller",
                          files: [
                            {
                              name: "AuthController.java",
                              path: "backend/src/main/java/com/finance/controller/AuthController.java",
                              language: "java",
                              code: `package com.finance.controller;

import com.finance.dto.LoginRequest;
import com.finance.dto.UserDto;
import com.finance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.register(userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest));
    }
}`
                            },
                            {
                              name: "FinanceController.java",
                              path: "backend/src/main/java/com/finance/controller/FinanceController.java",
                              language: "java",
                              code: `package com.finance.controller;

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
}`
                            }
                          ]
                        },
                        {
                          name: "entity",
                          files: [
                            {
                              name: "User.java",
                              path: "backend/src/main/java/com/finance/entity/User.java",
                              language: "java",
                              code: `package com.finance.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String avatarUrl;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DailyNote> dailyNotes = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }

    public List<DailyNote> getDailyNotes() {
        return dailyNotes;
    }

    public void setDailyNotes(List<DailyNote> dailyNotes) {
        this.dailyNotes = dailyNotes;
    }
}`
                            },
                            {
                              name: "Transaction.java",
                              path: "backend/src/main/java/com/finance/entity/Transaction.java",
                              language: "java",
                              code: `package com.finance.entity;

import com.finance.enums.Category;
import com.finance.enums.PaymentMethod;
import com.finance.enums.TransactionType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    private String notes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}`
                            },
                            {
                              name: "DailyNote.java",
                              path: "backend/src/main/java/com/finance/entity/DailyNote.java",
                              language: "java",
                              code: `package com.finance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_notes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "date"})
})
public class DailyNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}`
                            }
                          ]
                        },
                        {
                          name: "enums",
                          files: [
                            {
                              name: "TransactionType.java",
                              path: "backend/src/main/java/com/finance/enums/TransactionType.java",
                              language: "java",
                              code: `package com.finance.enums;

public enum TransactionType {
    ENTRATA,
    USCITA
}`
                            },
                            {
                              name: "PaymentMethod.java",
                              path: "backend/src/main/java/com/finance/enums/PaymentMethod.java",
                              language: "java",
                              code: `package com.finance.enums;

public enum PaymentMethod {
    CARTA,
    CONTANTI
}`
                            },
                            {
                              name: "Category.java",
                              path: "backend/src/main/java/com/finance/enums/Category.java",
                              language: "java",
                              code: `package com.finance.enums;

public enum Category {
    STIPENDIO,
    ALCOL,
    ALTRO,
    APPLE,
    BENZINA,
    LIQUIDI,
    REGALI,
    SHOPPING,
    SPESA,
    VITA
}`
                            }
                          ]
                        },
                        {
                          name: "repository",
                          files: [
                            {
                              name: "UserRepository.java",
                              path: "backend/src/main/java/com/finance/repository/UserRepository.java",
                              language: "java",
                              code: `package com.finance.repository;

import com.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
    boolean existsByName(String name);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}`
                            },
                            {
                              name: "TransactionRepository.java",
                              path: "backend/src/main/java/com/finance/repository/TransactionRepository.java",
                              language: "java",
                              code: `package com.finance.repository;

import com.finance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByUserId(Long userId);
}`
                            },
                            {
                              name: "DailyNoteRepository.java",
                              path: "backend/src/main/java/com/finance/repository/DailyNoteRepository.java",
                              language: "java",
                              code: `package com.finance.repository;

import com.finance.entity.DailyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyNoteRepository extends JpaRepository<DailyNote, Long> {
    Optional<DailyNote> findByUserIdAndDate(Long userId, LocalDate date);
}`
                            }
                          ]
                        },
                        {
                          name: "dto",
                          files: [
                            {
                              name: "UserDto.java",
                              path: "backend/src/main/java/com/finance/dto/UserDto.java",
                              language: "java",
                              code: `package com.finance.dto;

public record UserDto(
    Long id,
    String name,
    String email,
    String password,
    String avatarUrl
) {}`
                            },
                            {
                              name: "TransactionDto.java",
                              path: "backend/src/main/java/com/finance/dto/TransactionDto.java",
                              language: "java",
                              code: `package com.finance.dto;

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
) {}`
                            },
                            {
                              name: "DailyNoteDto.java",
                              path: "backend/src/main/java/com/finance/dto/DailyNoteDto.java",
                              language: "java",
                              code: `package com.finance.dto;

import java.time.LocalDate;
import java.util.List;

public record DailyNoteDto(
    Long id,
    LocalDate date,
    String content,
    List<TransactionDto> transactions
) {}`
                            },
                            {
                              name: "LoginRequest.java",
                              path: "backend/src/main/java/com/finance/dto/LoginRequest.java",
                              language: "java",
                              code: `package com.finance.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Il nome utente è obbligatorio")
    String username,
    
    @NotBlank(message = "La password è obbligatoria")
    String password
) {}`
                            }
                          ]
                        },
                        {
                          name: "service",
                          files: [
                            {
                              name: "FinanceService.java",
                              path: "backend/src/main/java/com/finance/service/FinanceService.java",
                              language: "java",
                              code: `package com.finance.service;

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
}`
                            },
                            {
                              name: "UserService.java",
                              path: "backend/src/main/java/com/finance/service/UserService.java",
                              language: "java",
                              code: `package com.finance.service;

import com.finance.dto.LoginRequest;
import com.finance.dto.UserDto;

public interface UserService {
    UserDto register(UserDto userDto);
    UserDto login(LoginRequest loginRequest);
}`
                            }
                          ],
                          folders: [
                            {
                              name: "impl",
                              files: [
                                {
                                  name: "FinanceServiceImpl.java",
                                  path: "backend/src/main/java/com/finance/service/impl/FinanceServiceImpl.java",
                                  language: "java",
                                  code: `package com.finance.service.impl;

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
}`
                                },
                                {
                                  name: "UserServiceImpl.java",
                                  path: "backend/src/main/java/com/finance/service/impl/UserServiceImpl.java",
                                  language: "java",
                                  code: `package com.finance.service.impl;

import com.finance.dto.LoginRequest;
import com.finance.dto.UserDto;
import com.finance.entity.User;
import com.finance.repository.UserRepository;
import com.finance.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDto register(UserDto userDto) {
        if (userRepository.existsByName(userDto.name())) {
            throw new IllegalArgumentException("Nome utente già esistente");
        }
        User user = new User();
        user.setName(userDto.name());
        user.setPassword(userDto.password()); // In produzione va cifrata (es. BCrypt)
        user.setAvatarUrl(userDto.avatarUrl());
        User saved = userRepository.save(user);
        return new UserDto(saved.getId(), saved.getName(), saved.getEmail(), null, saved.getAvatarUrl());
    }

    @Override
    public UserDto login(LoginRequest loginRequest) {
        User user = userRepository.findByName(loginRequest.username())
            .orElseThrow(() -> new IllegalArgumentException("Credenziali non valide"));
        if (!user.getPassword().equals(loginRequest.password())) {
            throw new IllegalArgumentException("Credenziali non valide");
        }
        return new UserDto(user.getId(), user.getName(), user.getEmail(), null, user.getAvatarUrl());
    }
}`
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              name: "resources",
              isOpen: true,
              files: [
                {
                  name: "application.properties",
                  path: "backend/src/main/resources/application.properties",
                  language: "properties",
                  code: `spring.application.name=finance-scheduler
server.port=\${PORT:8080}

# Database Configuration (MySQL con supporto a Railway e locale)
spring.datasource.url=\${MYSQLURL:jdbc:mysql://\${MYSQLHOST:localhost}:\${MYSQLPORT:3306}/\${MYSQLDATABASE:finance_db}?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC}
spring.datasource.username=\${MYSQLUSER:root}
spring.datasource.password=\${MYSQLPASSWORD:lavinia}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect`
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
