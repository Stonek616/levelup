package com.levelup.dto.request;

import lombok.Data;

@Data
public class CreateGameProfileRequest {
    private String platform;
    private String handle;
}
