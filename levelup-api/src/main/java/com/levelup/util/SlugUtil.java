package com.levelup.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE_AND_DASHES = Pattern.compile("[\\s-]+");
    private static final Pattern LEADING_TRAILING_DASHES = Pattern.compile("^-+|-+$");

    private SlugUtil() {}

    /**
     * Converts a display name into a URL-safe slug.
     * Examples:
     *   "Role-playing (RPG)" -> "role-playing-rpg"
     *   "Action"             -> "action"
     *   "4X"                 -> "4x"
     *   "Sci-Fi / Future"    -> "sci-fi-future"
     */
    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lower = normalized.toLowerCase();
        String collapsed = WHITESPACE_AND_DASHES.matcher(lower).replaceAll("-");
        String stripped = NON_LATIN.matcher(collapsed).replaceAll("");
        String trimmed = LEADING_TRAILING_DASHES.matcher(stripped).replaceAll("");
        return trimmed;
    }
}