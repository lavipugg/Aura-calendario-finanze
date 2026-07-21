package com.finance.dto;

public record UserDto(
    Long id,
    String name,
    String email,
    String password,
    String avatarUrl
) {}