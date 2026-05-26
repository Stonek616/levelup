package com.levelup.dto.request;

import com.levelup.model.enums.GamePlatform;
import com.levelup.model.enums.Mood;
import com.levelup.model.enums.TimeAvailable;
import lombok.Data;

@Data
public class WhatToPlayRequest {
  private GamePlatform platform = GamePlatform.ANY;
  private TimeAvailable timeAvailable = TimeAvailable.FEW_HOURS;
  private Mood mood = Mood.NEW;
  private boolean multiplayer = false;
  private boolean includeAlreadyPlayed = false;
  private boolean includeNewSuggestions = true;
}
