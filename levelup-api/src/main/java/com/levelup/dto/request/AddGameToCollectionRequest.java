package com.levelup.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Data;

@Data
public class AddGameToCollectionRequest {

  @NotNull private UUID gameId;
}
