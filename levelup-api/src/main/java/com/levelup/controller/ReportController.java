package com.levelup.controller;

import com.levelup.dto.request.CreateReportRequest;
import com.levelup.dto.request.UpdateReportRequest;
import com.levelup.dto.response.ReportResponse;
import com.levelup.model.enums.ReportStatus;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.ReportService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReportController {

  private final ReportService reportService;

  @PostMapping("/api/v1/reports")
  public ResponseEntity<ReportResponse> submitReport(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @RequestBody CreateReportRequest request) {
    return ResponseEntity.ok(reportService.submitReport(userDetails.getId(), request));
  }

  @GetMapping("/api/v1/admin/reports")
  public ResponseEntity<Page<ReportResponse>> getReports(
      @RequestParam(required = false) ReportStatus status,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(reportService.getReports(status, pageable));
  }

  @PatchMapping("/api/v1/admin/reports/{id}")
  public ResponseEntity<ReportResponse> updateReport(
      @PathVariable UUID id, @RequestBody UpdateReportRequest request) {
    return ResponseEntity.ok(reportService.updateReport(id, request));
  }
}
