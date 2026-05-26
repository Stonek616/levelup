package com.levelup.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.levelup.dto.request.CreateLibraryEntryRequest;
import com.levelup.dto.request.UpdateLibraryEntryRequest;
import com.levelup.dto.response.LibraryEntryResponse;
import com.levelup.model.enums.LibraryStatus;
import com.levelup.model.enums.OwnershipStatus;
import com.levelup.security.UserDetailsImpl;
import com.levelup.service.LibraryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/library")
@RequiredArgsConstructor
public class LibraryController {
    private final LibraryService libraryService;

    @GetMapping
    public ResponseEntity<Page<LibraryEntryResponse>> getLibrary(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) LibraryStatus status,
            @RequestParam(required = false) OwnershipStatus ownership,
            @RequestParam(required = false) String platform,
            Pageable pageable) {
        Page<LibraryEntryResponse> entries = libraryService.getUserLibrary(
                userDetails.getId(), status, ownership, platform, pageable);
        return ResponseEntity.ok(entries);
    }

    @PostMapping
    public ResponseEntity<LibraryEntryResponse> addToLibrary(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateLibraryEntryRequest request) {
        LibraryEntryResponse entry = libraryService.addToLibrary(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @PatchMapping("/{entryId}")
    public ResponseEntity<LibraryEntryResponse> updateEntry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID entryId,
            @Valid @RequestBody UpdateLibraryEntryRequest request) {
        LibraryEntryResponse entry = libraryService.updateEntry(entryId, userDetails.getId(), request);
        return ResponseEntity.ok(entry);
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteEntry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID entryId) {
        libraryService.deleteEntry(entryId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<LibraryEntryResponse> getEntryByGame(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID gameId) {
        return ResponseEntity.ok(libraryService.getEntryByGame(userDetails.getId(), gameId));
    }
}
