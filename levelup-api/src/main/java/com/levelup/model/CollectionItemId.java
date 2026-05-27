package com.levelup.model;

import java.io.Serializable;
import java.util.UUID;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode
public class CollectionItemId implements Serializable {
  private static final long serialVersionUID = 1L;

  private UUID collection;
  private UUID game;
}
