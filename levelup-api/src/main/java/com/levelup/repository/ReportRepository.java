package com.levelup.repository;

import com.levelup.model.Report;
import com.levelup.model.enums.ReportStatus;
import com.levelup.model.enums.ReportTargetType;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

  @Query(
      value =
          """
            SELECT r FROM Report r JOIN FETCH r.reporter
            WHERE r.status = :status
            ORDER BY r.createdAt DESC
            """,
      countQuery = "SELECT COUNT(r) FROM Report r WHERE r.status = :status")
  Page<Report> findByStatus(@Param("status") ReportStatus status, Pageable pageable);

  @Query(
      value =
          """
            SELECT r FROM Report r JOIN FETCH r.reporter
            ORDER BY r.createdAt DESC
            """,
      countQuery = "SELECT COUNT(r) FROM Report r")
  Page<Report> findAllPaged(Pageable pageable);

  boolean existsByReporterIdAndTargetTypeAndTargetId(
      UUID reporterId, ReportTargetType targetType, UUID targetId);
}
