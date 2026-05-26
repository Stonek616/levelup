package com.levelup.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendFriendRequestRequest {

  @NotNull(message = "targetUserId is required") private UUID targetUserId;
}
