package com.finance.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Il nome utente è obbligatorio")
    String username,
    
    @NotBlank(message = "La password è obbligatoria")
    String password
) {}