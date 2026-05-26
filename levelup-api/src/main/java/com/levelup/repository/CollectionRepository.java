package com.levelup.repository;

import com.levelup.model.Collection;
import com.levelup.model.enums.VisibilityType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, UUID> {

  List<Collection> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

  List<Collection> findByOwnerUsernameAndVisibilityIn(
      String username, List<VisibilityType> visibilities);
}
