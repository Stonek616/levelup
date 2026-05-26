package com.levelup.repository;

import com.levelup.model.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KeywordsRepository extends JpaRepository<Keyword, Integer> {}
