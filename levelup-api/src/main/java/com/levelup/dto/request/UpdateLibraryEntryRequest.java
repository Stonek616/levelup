package com.levelup.dto.request;

import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLibraryEntryRequest {
  private LibraryStatus status;
  private OwnershipStatus ownership;
  private List<String> platforms;
  private Integer rating;
}
