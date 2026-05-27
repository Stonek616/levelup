package com.levelup.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "genres")
@NoArgsConstructor
public class Genre extends TaxonomyBase {}
