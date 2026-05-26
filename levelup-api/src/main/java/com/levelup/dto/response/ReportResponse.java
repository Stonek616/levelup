package com.levelup.dto.response;

import com.levelup.model.Report;
import com.levelup.model.enums.ReportReason;
import com.levelup.model.enums.ReportStatus;
import com.levelup.model.enums.ReportTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private UUID id;
    private String reporterUsername;
    private ReportTargetType targetType;
    private UUID targetId;
    private ReportReason reason;
    private ReportStatus status;
    private String notes;
    private Instant createdAt;
    private Instant resolvedAt;

    public static ReportResponse from(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reporterUsername(report.getReporter().getUsername())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .status(report.getStatus())
                .notes(report.getNotes())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .build();
    }
}
