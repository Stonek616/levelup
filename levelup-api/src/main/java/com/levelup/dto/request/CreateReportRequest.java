package com.levelup.dto.request;

import com.levelup.model.enums.ReportReason;
import com.levelup.model.enums.ReportTargetType;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportRequest {
  private ReportTargetType targetType;
  private UUID targetId;
  private ReportReason reason;
}
