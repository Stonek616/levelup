package com.levelup.igdb;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class IgdbClient {

  private static final Logger log = LoggerFactory.getLogger(IgdbClient.class);

  private final IgdbTokenService tokenService;
  private final RestClient client;

  public IgdbClient(IgdbTokenService tokenService, @Value("${igdb.base-url}") String baseUrl) {
    this.tokenService = tokenService;
    this.client = RestClient.builder().baseUrl(baseUrl).build();
  }

  /**
   * Executes an Apicalypse query against the given IGDB endpoint and deserializes the response into
   * a list of the given type.
   *
   * @param endpoint the IGDB endpoint (e.g. "/games", "/genres", "/multiquery")
   * @param query the Apicalypse query string (e.g. "fields name; limit 10;")
   * @param type the parameterized type for deserialization
   * @return list of results
   */
  public <T> List<T> query(
      String endpoint, String query, ParameterizedTypeReference<List<T>> type) {
    log.debug("IGDB {} -> {}", endpoint, query.replaceAll("\\s+", " "));

    return client
        .post()
        .uri(endpoint)
        .header("Client-ID", tokenService.getClientId())
        .header("Authorization", "Bearer " + tokenService.getToken())
        .contentType(MediaType.TEXT_PLAIN)
        .body(query)
        .retrieve()
        .body(type);
  }
}
