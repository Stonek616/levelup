package com.levelup.igdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class IgdbTokenService {

  private static final Logger log = LoggerFactory.getLogger(IgdbTokenService.class);

  private final String clientId;
  private final String clientSecret;
  private final String tokenUrl;
  private final RestClient tokenClient;

  private String currentToken;
  private Instant expiresAt;

  public IgdbTokenService(
      @Value("${igdb.client-id}") String clientId,
      @Value("${igdb.client-secret}") String clientSecret,
      @Value("${igdb.token-url}") String tokenUrl) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tokenUrl = tokenUrl;
    this.tokenClient = RestClient.create();
  }

  /**
   * Returns a valid bearer token, refreshing it if expired or absent. Refreshes 5 minutes before
   * actual expiry to avoid edge-case 401s.
   */
  public synchronized String getToken() {
    if (currentToken == null || Instant.now().isAfter(expiresAt.minusSeconds(300))) {
      refreshToken();
    }
    return currentToken;
  }

  private void refreshToken() {
    log.info("Refreshing Twitch OAuth token for IGDB");

    String url =
        String.format(
            "%s?client_id=%s&client_secret=%s&grant_type=client_credentials",
            tokenUrl, clientId, clientSecret);

    TwitchTokenResponse response =
        tokenClient
            .post()
            .uri(url)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .retrieve()
            .body(TwitchTokenResponse.class);

    if (response == null || response.accessToken() == null) {
      throw new IllegalStateException("Twitch returned an empty token response");
    }

    this.currentToken = response.accessToken();
    this.expiresAt = Instant.now().plusSeconds(response.expiresIn());

    log.info("New token acquired, expires at {}", expiresAt);
  }

  public String getClientId() {
    return clientId;
  }

  /**
   * The shape Twitch returns for a client_credentials token request. @JsonProperty maps the
   * snake_case JSON fields to our camelCase record components.
   */
  private record TwitchTokenResponse(
      @JsonProperty("access_token") String accessToken,
      @JsonProperty("expires_in") long expiresIn,
      @JsonProperty("token_type") String tokenType) {}
}
