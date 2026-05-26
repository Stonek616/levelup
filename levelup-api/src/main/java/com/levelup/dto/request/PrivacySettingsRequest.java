package com.levelup.dto.request;

import com.levelup.model.enums.VisibilityType;
import lombok.Data;

@Data
public class PrivacySettingsRequest {
    private VisibilityType libraryVisibility;
    private VisibilityType wishlistVisibility;
    private VisibilityType reviewsVisibility;
}
