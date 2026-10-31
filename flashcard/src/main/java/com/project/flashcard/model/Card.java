package com.project.flashcard.model;

import java.util.UUID;

public class Card {
    private String id;
    private String frontText;
    private String backText;
    private String difficultyLevel;

    public Card() {
        this.id = UUID.randomUUID().toString(); // Auto-generates a unique ID
        this.difficultyLevel = "New";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFrontText() { return frontText; }
    public void setFrontText(String frontText) { this.frontText = frontText; }
    public String getBackText() { return backText; }
    public void setBackText(String backText) { this.backText = backText; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
}
