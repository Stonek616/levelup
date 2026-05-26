package com.levelup.dto.request;

import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLibraryEntryRequest {

  @NotNull(message = "gameId is required") private UUID gameId;

  // null is valid for WISHLIST entries
  private LibraryStatus status;

  @NotNull(message = "ownership is required") private OwnershipStatus ownership;

  private List<String> platforms;
}
