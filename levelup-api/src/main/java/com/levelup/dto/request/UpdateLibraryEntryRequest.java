package com.levelup.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.levelup.model.enums.LibraryStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLibraryEntryRequest {
        private LibraryStatus status;
        private Boolean isOwned;
        private List<String> platforms;
        private Integer rating;
}
