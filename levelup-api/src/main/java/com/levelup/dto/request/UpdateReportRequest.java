package com.levelup.dto.request;

import com.levelup.model.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReportRequest {
  private ReportStatus status;
  private String notes;
  private boolean deleteContent;
}
