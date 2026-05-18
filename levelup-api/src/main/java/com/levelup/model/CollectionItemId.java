package com.levelup.model;

import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@NoArgsConstructor
@EqualsAndHashCode
public class CollectionItemId implements Serializable {
    private UUID collection;
    private UUID game;
}