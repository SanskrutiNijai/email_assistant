package com.email.writer;

import lombok.Data;

@Data
public class SummarizeRequest {
    private String emailContent;

    /** * Optional: "short" | "medium" | "long" — your frontend can pass this. */
    private String summaryLength;

}