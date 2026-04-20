package com.levelup.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import lombok.RequiredArgsConstructor;
import com.levelup.security.JwtAuthFilter;



@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                // Public endpoints — game browsing
                .requestMatchers(HttpMethod.GET, "/api/v1/games/**").permitAll()
                // Public endpoints — discovery
                .requestMatchers(HttpMethod.GET, "/api/v1/discover/trending").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/discover/new").permitAll()
                // Public endpoints — user profiles and taste profiles
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}/taste-profile").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}/reviews").permitAll()
                // Public endpoints — reviews and collections
                .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/collections/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/users/{username}/collections").permitAll()
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}