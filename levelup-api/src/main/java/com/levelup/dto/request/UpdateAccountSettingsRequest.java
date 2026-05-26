package com.levelup.dto.request;

import lombok.Data;

@Data
public class UpdateAccountSettingsRequest {
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private String currentPassword;
    private String newPassword;
}
