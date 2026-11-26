package dev.corypahl.christmas;

import org.junit.Test;
import static org.junit.Assert.*;

public final class NavigationPolicyTest {
    @Test public void onlyAllowsChristmasOriginAndPath() {
        assertTrue(NavigationPolicy.isChristmasUrl("https://kids.corypahl.dev/christmas/"));
        assertTrue(NavigationPolicy.isChristmasUrl("https://kids.corypahl.dev/christmas/api/state?child=emma"));
        assertFalse(NavigationPolicy.isChristmasUrl("https://evil.example/christmas"));
        assertFalse(NavigationPolicy.isChristmasUrl("https://kids.corypahl.dev/"));
        assertFalse(NavigationPolicy.isChristmasUrl("https://kids.corypahl.dev/christmas-other"));
        assertFalse(NavigationPolicy.isChristmasUrl("http://kids.corypahl.dev/christmas/"));
        assertFalse(NavigationPolicy.isChristmasUrl("javascript:alert(1)"));
    }
}
