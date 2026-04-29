package com.levelup.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class WebClientConfig {
    @Value("${igdb.base-url}")
    private String igdbBaseUrl;

    @Bean
    public WebClient igdbWebClient() {
        return WebClient.builder()  
            .baseUrl(igdbBaseUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN_VALUE)
            .build();
    }
}