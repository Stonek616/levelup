package com.levelup.repository;

import com.levelup.model.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ThemeRepository extends JpaRepository<Theme, Integer> {
    
}
