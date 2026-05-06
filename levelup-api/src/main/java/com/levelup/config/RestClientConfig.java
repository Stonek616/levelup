package com.levelup.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${igdb.base-url}")
    private String igdbBaseUrl;

    @Bean
    public RestClient igdbRestClient() {
        return RestClient.builder()
            .baseUrl(igdbBaseUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN_VALUE)
            .build();
    }
}