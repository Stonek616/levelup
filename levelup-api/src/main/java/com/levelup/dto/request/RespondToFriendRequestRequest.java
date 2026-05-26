package com.levelup.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespondToFriendRequestRequest {

  @NotBlank(message = "action is required") @Pattern(regexp = "(?i)ACCEPT|DECLINE", message = "action must be ACCEPT or DECLINE")
  private String action;
}
