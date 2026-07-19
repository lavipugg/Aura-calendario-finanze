package com.finance.service;

import com.finance.dto.LoginRequest;
import com.finance.dto.UserDto;

public interface UserService {
    UserDto register(UserDto userDto);
    UserDto login(LoginRequest loginRequest);
}