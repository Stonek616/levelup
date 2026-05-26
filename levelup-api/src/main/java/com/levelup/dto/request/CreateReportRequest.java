package com.levelup.dto.request;

import com.levelup.model.enums.ReportReason;
import com.levelup.model.enums.ReportTargetType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportRequest {
    private ReportTargetType targetType;
    private UUID targetId;
    private ReportReason reason;
}
