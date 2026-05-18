package com.levelup.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendFriendRequestRequest {

    @NotNull(message = "targetUserId is required")
    private UUID targetUserId;
}
