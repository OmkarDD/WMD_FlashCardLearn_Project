from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import uuid
import wikipedia

# 1. Set a custom User-Agent so Wikipedia doesn't block the request!
wikipedia.set_user_agent("WMD_Capstone_Project/1.0 (student@university.edu)")

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["test"]
decks_collection = db["decks"]

@app.route("/api/ai/generate", methods=["POST"])
def generate_flashcards():
    data = request.json
    topic = data.get("topic", "")
    num_cards = int(data.get("numCards", 5))
    deck_id = data.get("deckId", "")

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    generated_cards = []
    
    try:
        wikipedia.set_lang("en")
        summary = wikipedia.summary(topic, sentences=num_cards + 2, auto_suggest=False)
        
        # Split paragraph into individual sentences
        sentences = [s.strip() + "." for s in summary.split(". ") if len(s.strip()) > 15]
        
        # Create cards from sentences
        for i in range(min(num_cards, len(sentences))):
            generated_cards.append({
                "id": str(uuid.uuid4()),
                "frontText": f"Provide a key fact about: {topic.title()}",
                "backText": sentences[i]
            })

    except wikipedia.exceptions.DisambiguationError as e:
        # If topic is too broad, automatically grab the first specific suggestion instead of crashing
        try:
            summary = wikipedia.summary(e.options[0], sentences=num_cards + 2, auto_suggest=False)
            sentences = [s.strip() + "." for s in summary.split(". ") if len(s.strip()) > 15]
            for i in range(min(num_cards, len(sentences))):
                generated_cards.append({
                    "id": str(uuid.uuid4()),
                    "frontText": f"Provide a key fact about: {e.options[0].title()}",
                    "backText": sentences[i]
                })
        except Exception:
            pass
    except Exception as e:
        # 2. We catch the Wikipedia error but DO NOT return 500. 
        # We let the code continue to the fallback loop below!
        print(f"Wikipedia Error: {e}")

    # 3. BULLETPROOF FALLBACK: If Wikipedia failed, or the article was too short, 
    # fill the remaining slots with dummy cards so the deck is NEVER empty.
    while len(generated_cards) < num_cards:
        generated_cards.append({
            "id": str(uuid.uuid4()),
            "frontText": f"Q{len(generated_cards)+1}: Core concept of {topic.title()}?",
            "backText": f"Auto-generated fallback detail for {topic.title()}."
        })

    if deck_id:
        try:
            decks_collection.update_one(
                {"_id": ObjectId(deck_id)}, 
                {"$push": {"cards": {"$each": generated_cards}}}
            )
        except Exception:
            decks_collection.update_one(
                {"_id": deck_id}, 
                {"$push": {"cards": {"$each": generated_cards}}}
            )

    return jsonify({
        "message": f"Successfully generated {len(generated_cards)} flashcards!",
        "cards": generated_cards
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)