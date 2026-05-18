package com.levelup.dto.request;

import com.levelup.model.enums.Mood;
import com.levelup.model.enums.TimeAvailable;
import com.levelup.model.enums.WhatToPlayPlatform;
import lombok.Data;

@Data
public class WhatToPlayRequest {
    private WhatToPlayPlatform platform = WhatToPlayPlatform.ANY;
    private TimeAvailable timeAvailable = TimeAvailable.FEW_HOURS;
    private Mood mood = Mood.ANYTHING;
    private boolean multiplayer = false;
    private boolean includeAlreadyPlayed = false;
    private boolean includeNewSuggestions = true;
}
