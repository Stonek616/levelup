package com.levelup.service;

import com.levelup.dto.request.CreateReportRequest;
import com.levelup.dto.request.UpdateReportRequest;
import com.levelup.dto.response.ReportResponse;
import com.levelup.model.Report;
import com.levelup.model.enums.ReportStatus;
import com.levelup.model.enums.ReportTargetType;
import com.levelup.repository.ReportRepository;
import com.levelup.repository.ReviewCommentRepository;
import com.levelup.repository.ReviewRepository;
import com.levelup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;

    @Transactional
    public ReportResponse submitReport(UUID reporterId, CreateReportRequest request) {
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporterId, request.getTargetType(), request.getTargetId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reported this content");
        }

        Report report = new Report();
        report.setReporter(userRepository.getReferenceById(reporterId));
        report.setTargetType(request.getTargetType());
        report.setTargetId(request.getTargetId());
        report.setReason(request.getReason());

        return ReportResponse.from(reportRepository.save(report));
    }

    public Page<ReportResponse> getReports(ReportStatus status, Pageable pageable) {
        Page<Report> page = status != null
                ? reportRepository.findByStatus(status, pageable)
                : reportRepository.findAllPaged(pageable);
        return page.map(ReportResponse::from);
    }

    @Transactional
    public ReportResponse updateReport(UUID reportId, UpdateReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        report.setStatus(request.getStatus());
        report.setNotes(request.getNotes());
        if (request.getStatus() != ReportStatus.PENDING) {
            report.setResolvedAt(Instant.now());
        }

        if (request.isDeleteContent() && request.getStatus() == ReportStatus.RESOLVED) {
            deleteTarget(report.getTargetType(), report.getTargetId());
        }

        return ReportResponse.from(reportRepository.save(report));
    }

    private void deleteTarget(ReportTargetType targetType, UUID targetId) {
        switch (targetType) {
            case REVIEW -> reviewRepository.deleteById(targetId);
            case COMMENT -> reviewCommentRepository.deleteById(targetId);
            case USER -> userRepository.findById(targetId).ifPresent(user -> {
                user.setDeletedAt(java.time.LocalDateTime.now());
                userRepository.save(user);
            });
        }
    }
}
