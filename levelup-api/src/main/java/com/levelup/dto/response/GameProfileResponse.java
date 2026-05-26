package com.levelup.dto.response;

import com.levelup.model.GameProfile;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GameProfileResponse {
  private UUID id;
  private String platform;
  private String handle;

  public static GameProfileResponse from(GameProfile gp) {
    return GameProfileResponse.builder()
        .id(gp.getId())
        .platform(gp.getPlatform())
        .handle(gp.getHandle())
        .build();
  }
}
