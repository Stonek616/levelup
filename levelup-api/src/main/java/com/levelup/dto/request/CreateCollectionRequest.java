package com.levelup.dto.request;

import com.levelup.model.enums.VisibilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCollectionRequest {

  @NotBlank @Size(max = 100) private String name;

  private String description;

  private VisibilityType visibility = VisibilityType.PUBLIC;
}
