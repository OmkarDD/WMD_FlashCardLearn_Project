package com.project.flashcard.repository; // Update to your actual package

import com.project.flashcard.model.Deck;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeckRepository extends MongoRepository<Deck, String> {
}