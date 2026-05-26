package com.levelup.repository;

import com.levelup.model.CollectionItem;
import com.levelup.model.CollectionItemId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionItemRepository extends JpaRepository<CollectionItem, CollectionItemId> {

  @Query(
      "SELECT ci FROM CollectionItem ci JOIN FETCH ci.game WHERE ci.collection.id = :collectionId ORDER BY ci.addedAt DESC")
  List<CollectionItem> findByCollectionIdWithGame(@Param("collectionId") UUID collectionId);

  boolean existsByCollectionIdAndGameId(UUID collectionId, UUID gameId);

  void deleteByCollectionIdAndGameId(UUID collectionId, UUID gameId);
}
