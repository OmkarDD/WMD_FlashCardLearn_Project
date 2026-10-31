package com.project.flashcard.controller; 

import com.project.flashcard.model.Card;
import com.project.flashcard.model.Deck;
import com.project.flashcard.repository.DeckRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "http://localhost:5173")
public class DeckController {

    private final DeckRepository deckRepository;

    public DeckController(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
    }

    @GetMapping
    public List<Deck> getAllDecks() {
        return deckRepository.findAll();
    }

    @PostMapping
    public Deck createDeck(@RequestBody Deck deck) {
        return deckRepository.save(deck);
    }

    @PostMapping("/{deckId}/cards")
    public Deck addCardToDeck(@PathVariable String deckId, @RequestBody Card card) {
        Optional<Deck> optionalDeck = deckRepository.findById(deckId);
        if (optionalDeck.isPresent()) {
            Deck deck = optionalDeck.get();
            deck.getCards().add(card);
            return deckRepository.save(deck);
        }
        throw new RuntimeException("Deck not found!");
    }

    @GetMapping("/{deckId}")
    public Deck getDeckById(@PathVariable String deckId) {
        return deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck not found"));
    }

    @DeleteMapping("/{deckId}")
    public void deleteDeck(@PathVariable String deckId) {
        deckRepository.deleteById(deckId);
    }
}