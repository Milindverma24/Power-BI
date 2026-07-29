package com.aibi.controller;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@Slf4j
public class MeetingWebSocketController {

    private final ChatLanguageModel chatModel;

    @Data
    public static class ChatMessage {
        private String id;
        private String sender;
        private String content;
        private LocalDateTime timestamp;
        private boolean isAi;
    }

    public MeetingWebSocketController(@Value("${langchain4j.gemini.chat.model.api-key}") String apiKey,
                                      @Value("${langchain4j.gemini.chat.model.model-name}") String modelName) {
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .temperature(0.7) // Creative for meetings
                .build();
    }

    @MessageMapping("/meeting.chat/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public ChatMessage handleMeetingMessage(@DestinationVariable String roomId, @Payload ChatMessage message) {
        // We receive a message from a user, broadcast it back to the room.
        message.setTimestamp(LocalDateTime.now());
        message.setAi(false);
        return message;
    }

    @MessageMapping("/meeting.ask-ai/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public ChatMessage handleAiQuestion(@DestinationVariable String roomId, @Payload ChatMessage userMessage) {
        // When user explicitly asks AI using a specific action, this handles it.
        String prompt = "You are an AI BI meeting assistant in a collaborative dashboard review. " +
                        "A participant asked: \"" + userMessage.getContent() + "\"\n" +
                        "Respond concisely and professionally, keeping your answer short since it's a real-time chat.";
        
        String aiResponseText = "AI is thinking...";
        try {
            aiResponseText = chatModel.generate(prompt);
        } catch (Exception e) {
            log.error("Failed to generate AI response for meeting room {}", roomId, e);
            aiResponseText = "I'm sorry, I am currently unable to process requests.";
        }

        ChatMessage aiMessage = new ChatMessage();
        aiMessage.setId(java.util.UUID.randomUUID().toString());
        aiMessage.setSender("AI Assistant");
        aiMessage.setContent(aiResponseText);
        aiMessage.setTimestamp(LocalDateTime.now());
        aiMessage.setAi(true);

        return aiMessage;
    }
}
