package com.grammitra.backend.dto;

import lombok.Data;

@Data
public class ChatResponse {

    /** Bot reply text (already localized in user's language). */
    private String reply;

    /** Detected ChatIntent name. */
    private String intent;

    /** Dynamic payload: worker list / booking / selected worker — varies by intent. */
    private Object data;

    /**
     * When non-null, the frontend should offer the user a CTA to navigate to
     * this app route. Examples: "/dashboard/user", "/dashboard/worker/profile/edit",
     * "/services/ac-repair".
     */
    private String navigatePath;

    /**
     * Canonical skill slug (hyphenated) when the bot identified one. The
     * frontend uses this to build "/services/<slug>" links and to set the
     * matchedSkill prop on inline WorkerCards.
     */
    private String skillSlug;
}
