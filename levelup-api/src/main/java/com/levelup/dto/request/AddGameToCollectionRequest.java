package com.levelup.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddGameToCollectionRequest {

    @NotNull
    private UUID gameId;
}
