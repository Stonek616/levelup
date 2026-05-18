package com.levelup.dto.request;

import java.util.List;
import java.util.UUID;

import com.levelup.model.enums.LibraryStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLibraryEntryRequest {

    @NotNull(message = "gameId is required")
    private UUID gameId;

    @NotNull(message = "status is required")
    private LibraryStatus status;

    @NotNull(message = "isOwned is required")
    private Boolean isOwned;

    private List<String> platforms;
}
