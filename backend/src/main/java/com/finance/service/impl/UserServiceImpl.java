package com.finance.service.impl;

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
        if (userRepository.existsByEmail(userDto.email())) {
            throw new IllegalArgumentException("Email già registrata");
        }
        User user = new User();
        user.setName(userDto.name());
        user.setEmail(userDto.email());
        user.setPassword(userDto.password()); // Per semplicità in chiaro, in produzione usa BCrypt
        User saved = userRepository.save(user);
        return new UserDto(saved.getId(), saved.getName(), saved.getEmail(), null);
    }

    @Override
    public UserDto login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email())
            .orElseThrow(() -> new IllegalArgumentException("Credenziali non valide"));
        if (!user.getPassword().equals(loginRequest.password())) {
            throw new IllegalArgumentException("Credenziali non valide");
        }
        return new UserDto(user.getId(), user.getName(), user.getEmail(), null);
    }
}