package com.email.writer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    private final String apiKey;

    public EmailGeneratorService(
            WebClient.Builder webClientBuilder,
            @Value("${gemini.api.url}") String baseUrl,
            @Value("${gemini.api.key}") String geminiApiKey
    ) {
        this.apiKey = geminiApiKey;
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    /**
     * Generate a professional email reply using Gemini API.
     */
    public String generateEmailReply(EmailRequest emailRequest) {
        String prompt = buildReplyPrompt(emailRequest);
        String requestBody = buildRequestBody(prompt);
        String response = callModel(requestBody);
        return extractResponseContent(response);
    }

    /**
     * Summarize an email using Gemini API.
     */
    public String summarizeEmail(SummarizeRequest summarizeRequest) {
        String prompt = buildSummarizePrompt(
                summarizeRequest.getEmailContent(),
                summarizeRequest.getSummaryLength()
        );

        String requestBody = buildRequestBody(prompt);
        String response = callModel(requestBody);

        return extractResponseContent(response);
    }

    /**
     * Calls Gemini model via WebClient.
     */
    private String callModel(String requestBody) {
        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("v1beta/models/gemini-2.5-flash:generateContent")
                        .build()
                )
                .header("x-goog-api-key", apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    /**
     * Build request body for Gemini.
     */
    private String buildRequestBody(String prompt) {
        return String.format("""
            {
              "contents": [
                {
                  "parts": [
                    { "text": "%s" }
                  ]
                }
              ]
            }
        """, escapeForJson(prompt));
    }

    /**
     * Build the prompt for generating a reply.
     */
    private String buildReplyPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email.");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append(" Use a ").append(emailRequest.getTone()).append(" tone.");
        }

        prompt.append("\n\nOriginal Email:\n")
                .append(emailRequest.getEmailContent());

        return prompt.toString();
    }

    /**
     * Build the prompt for summarization.
     */
    private String buildSummarizePrompt(String emailContent, String summaryLength) {
        String lengthDesc = switch (summaryLength.toLowerCase()) {
            case "medium" -> "a medium-length";
            case "long" -> "a detailed";
            default -> "a short";
        };

        return new StringBuilder()
                .append("Summarize the following email into ")
                .append(lengthDesc)
                .append(" clear bullet-points followed by a 1–2 sentence summary. ")
                .append("Do not add extra commentary.\n\nEmail:\n")
                .append(emailContent)
                .toString();
    }

    /**
     * Extract the response text from Gemini API JSON.
     */
    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            JsonNode candidates = root.path("candidates");
            if (!candidates.isMissingNode() && candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();
            }

            // Fallback: return raw response if unexpected shape
            return root.toString();

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse model response", e);

        } catch (Exception ex) {
            throw new RuntimeException("Unexpected model response shape", ex);
        }
    }

    /**
     * Simple escaping to keep JSON valid.
     */
    private String escapeForJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");
    }
}
