package com.grammitra.backend.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Canonical skill list — MUST stay in sync with the frontend's
 * features/gram-mitra/utils/skills.ts. Workers store their skills using these
 * exact strings, so any search query has to canonicalize to one of these
 * values before hitting the database.
 *
 * The alias map handles colloquial / Hindi / Hinglish terms so the chatbot
 * can map "बिजली वाला", "electrician", "bijli wala", "wiring" all to the
 * canonical "electrical wiring".
 */
public final class SkillCatalog {

    private SkillCatalog() {}

    public static final List<String> SKILLS = List.of(
            // Home appliance
            "ac repair", "refrigerator repair", "washing machine repair",
            "microwave repair", "geyser repair", "water purifier repair",
            "chimney repair",
            // Electronics
            "tv repair", "mobile repair", "laptop repair",
            "electrical wiring", "inverter repair",
            // Plumbing
            "plumbing", "water tank cleaning", "leakage fixing",
            "motor pump repair",
            // Cleaning
            "house cleaning", "deep cleaning", "kitchen cleaning",
            "bathroom cleaning", "sofa cleaning",
            // Personal
            "maid", "cook", "babysitter", "elder care",
            "beautician", "haircut",
            // Education
            "tuition", "math tutor", "english tutor", "computer training",
            // Construction
            "carpenter", "painter", "mason", "interior repair",
            // Rural
            "tractor repair", "solar panel", "agriculture pump", "fencing"
    );

    private static final Set<String> SKILL_SET = Set.copyOf(SKILLS);

    /** Alias → canonical skill. Lowercased on both sides. */
    private static final Map<String, String> ALIASES = Map.ofEntries(
            // Electrical
            Map.entry("electrician", "electrical wiring"),
            Map.entry("electric", "electrical wiring"),
            Map.entry("electrical", "electrical wiring"),
            Map.entry("wiring", "electrical wiring"),
            Map.entry("bijli", "electrical wiring"),
            Map.entry("bijli wala", "electrical wiring"),
            Map.entry("बिजली", "electrical wiring"),
            Map.entry("बिजली वाला", "electrical wiring"),
            Map.entry("इलेक्ट्रीशियन", "electrical wiring"),

            // Plumbing
            Map.entry("plumber", "plumbing"),
            Map.entry("pipe", "plumbing"),
            Map.entry("pipe repair", "plumbing"),
            Map.entry("प्लंबर", "plumbing"),
            Map.entry("नल", "plumbing"),
            Map.entry("leak", "leakage fixing"),
            Map.entry("leakage", "leakage fixing"),
            Map.entry("tank", "water tank cleaning"),

            // Appliances
            Map.entry("ac", "ac repair"),
            Map.entry("a c", "ac repair"),
            Map.entry("air conditioner", "ac repair"),
            Map.entry("एसी", "ac repair"),
            Map.entry("fridge", "refrigerator repair"),
            Map.entry("refrigerator", "refrigerator repair"),
            Map.entry("फ्रिज", "refrigerator repair"),
            Map.entry("washing machine", "washing machine repair"),
            Map.entry("microwave", "microwave repair"),
            Map.entry("oven", "microwave repair"),
            Map.entry("geyser", "geyser repair"),
            Map.entry("heater", "geyser repair"),
            Map.entry("गीजर", "geyser repair"),
            Map.entry("ro", "water purifier repair"),
            Map.entry("purifier", "water purifier repair"),
            Map.entry("water purifier", "water purifier repair"),
            Map.entry("chimney", "chimney repair"),

            // Electronics
            Map.entry("tv", "tv repair"),
            Map.entry("television", "tv repair"),
            Map.entry("टीवी", "tv repair"),
            Map.entry("mobile", "mobile repair"),
            Map.entry("phone", "mobile repair"),
            Map.entry("smartphone", "mobile repair"),
            Map.entry("मोबाइल", "mobile repair"),
            Map.entry("laptop", "laptop repair"),
            Map.entry("pc", "laptop repair"),
            Map.entry("लैपटॉप", "laptop repair"),
            Map.entry("inverter", "inverter repair"),
            Map.entry("battery", "inverter repair"),
            Map.entry("ups", "inverter repair"),

            // Cleaning
            Map.entry("cleaner", "house cleaning"),
            Map.entry("cleaning", "house cleaning"),
            Map.entry("safai", "house cleaning"),
            Map.entry("safaiwala", "house cleaning"),
            Map.entry("housekeeping", "house cleaning"),
            Map.entry("सफाई", "house cleaning"),
            Map.entry("sofa", "sofa cleaning"),
            Map.entry("kitchen", "kitchen cleaning"),
            Map.entry("bathroom", "bathroom cleaning"),
            Map.entry("washroom", "bathroom cleaning"),
            Map.entry("toilet", "bathroom cleaning"),

            // Personal
            Map.entry("kaamwali", "maid"),
            Map.entry("कामवाली", "maid"),
            Map.entry("मेड", "maid"),
            Map.entry("chef", "cook"),
            Map.entry("रसोइया", "cook"),
            Map.entry("कुक", "cook"),
            Map.entry("nanny", "babysitter"),
            Map.entry("babysitting", "babysitter"),
            Map.entry("बेबीसिटर", "babysitter"),
            Map.entry("elder", "elder care"),
            Map.entry("senior", "elder care"),
            Map.entry("old", "elder care"),
            Map.entry("बुजुर्ग", "elder care"),
            Map.entry("barber", "haircut"),
            Map.entry("salon", "haircut"),
            Map.entry("hair", "haircut"),
            Map.entry("नाई", "haircut"),
            Map.entry("beauty", "beautician"),
            Map.entry("parlor", "beautician"),
            Map.entry("makeup", "beautician"),
            Map.entry("ब्यूटीशियन", "beautician"),

            // Education
            Map.entry("tutor", "tuition"),
            Map.entry("teacher", "tuition"),
            Map.entry("ट्यूशन", "tuition"),
            Map.entry("math", "math tutor"),
            Map.entry("maths", "math tutor"),
            Map.entry("mathematics", "math tutor"),
            Map.entry("गणित", "math tutor"),
            Map.entry("english", "english tutor"),
            Map.entry("अंग्रेज़ी", "english tutor"),
            Map.entry("computer", "computer training"),
            Map.entry("coding", "computer training"),
            Map.entry("कंप्यूटर", "computer training"),

            // Construction
            Map.entry("carpentry", "carpenter"),
            Map.entry("woodwork", "carpenter"),
            Map.entry("बढ़ई", "carpenter"),
            Map.entry("paint", "painter"),
            Map.entry("painting", "painter"),
            Map.entry("पेंटर", "painter"),
            Map.entry("राजमिस्त्री", "mason"),
            Map.entry("interior", "interior repair"),

            // Rural
            Map.entry("tractor", "tractor repair"),
            Map.entry("ट्रैक्टर", "tractor repair"),
            Map.entry("solar", "solar panel"),
            Map.entry("panel", "solar panel"),
            Map.entry("सोलर", "solar panel"),
            Map.entry("motor", "motor pump repair"),
            Map.entry("pump", "motor pump repair"),
            Map.entry("agriculture", "agriculture pump"),
            Map.entry("farming", "agriculture pump"),
            Map.entry("कृषि", "agriculture pump"),
            Map.entry("fence", "fencing"),
            Map.entry("बाड़", "fencing")
    );

    /** Canonical skill if input is recognized; empty string otherwise. */
    public static String canonicalize(String raw) {
        if (raw == null) return "";
        String norm = raw.trim().toLowerCase()
                .replace('-', ' ')
                .replaceAll("\\s+", " ");
        if (norm.isEmpty()) return "";

        // 1. Exact match on canonical list.
        if (SKILL_SET.contains(norm)) return norm;

        // 2. Exact match on alias.
        if (ALIASES.containsKey(norm)) return ALIASES.get(norm);

        // 3. Token scan: try each alias against the normalized string.
        for (Map.Entry<String, String> e : ALIASES.entrySet()) {
            String key = e.getKey();
            if (norm.equals(key)) return e.getValue();
            if (norm.contains(" " + key + " ")
                    || norm.startsWith(key + " ")
                    || norm.endsWith(" " + key)) {
                return e.getValue();
            }
        }

        // 4. Substring scan against canonical list.
        for (String skill : SKILLS) {
            if (norm.contains(skill)) return skill;
        }

        return "";
    }

    /** URL slug for /services/<slug> route. */
    public static String slug(String canonical) {
        if (canonical == null || canonical.isEmpty()) return "";
        return canonical.replace(' ', '-');
    }

    /** Comma-separated list for embedding in AI prompt. */
    public static String inlineList() {
        return String.join(", ", SKILLS);
    }
}
