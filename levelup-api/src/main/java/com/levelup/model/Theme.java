package com.levelup.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "themes")
@NoArgsConstructor
public class Theme extends TaxonomyBase {}
