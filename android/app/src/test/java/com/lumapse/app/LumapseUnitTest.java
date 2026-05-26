package com.lumapse.app;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class LumapseUnitTest {

    @Test
    public void testPackage_matchesLumapsePackage() {
        assertEquals("com.lumapse.app", LumapseUnitTest.class.getPackage().getName());
    }
}
