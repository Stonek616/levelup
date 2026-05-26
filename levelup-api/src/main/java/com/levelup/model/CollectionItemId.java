package com.levelup.model;

import java.io.Serializable;
import java.util.UUID;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@EqualsAndHashCode
public class CollectionItemId implements Serializable {
  private UUID collection;
  private UUID game;
}
