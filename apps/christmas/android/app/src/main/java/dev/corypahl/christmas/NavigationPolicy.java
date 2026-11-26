package dev.corypahl.christmas;

import java.net.URI;
import java.net.URISyntaxException;

public final class NavigationPolicy {
    private NavigationPolicy() {}
    public static boolean isChristmasUrl(String raw) {
        URI uri = parse(raw);
        if (uri == null || !"https".equalsIgnoreCase(uri.getScheme())
                || !"kids.corypahl.dev".equalsIgnoreCase(uri.getHost())) return false;
        String path = uri.normalize().getPath();
        return "/christmas".equals(path) || path.startsWith("/christmas/");
    }
    public static boolean isExternalWebUrl(String raw) {
        URI uri = parse(raw);
        return uri != null && uri.getHost() != null &&
                ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()));
    }
    private static URI parse(String raw) {
        try { return raw == null ? null : new URI(raw); }
        catch (URISyntaxException | IllegalArgumentException ex) { return null; }
    }
}
