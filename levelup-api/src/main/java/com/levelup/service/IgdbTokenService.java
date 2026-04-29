package com.levelup.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IgdbTokenService {
    
    private final GameRepository gameRepository;
    private final WebClient igdbWebClient;

    private IgdbTokenService igdbTokenService;

    public Page<GameSummaryResponse> searchGames(String query, Pageable pageable){
        List<IgdbGameDto> igdbResults = fetchFromIgdb(query);
        List<Game> fromIgdb = iigdbResults.stream();
        
    }
}
