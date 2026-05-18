package com.levelup.dto.request;

import com.levelup.model.enums.VisibilityType;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCollectionRequest {

    @Size(max = 100)
    private String name;

    private String description;

    private VisibilityType visibility;
}
