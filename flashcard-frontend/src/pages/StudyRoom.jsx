import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function StudyRoom() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [flippedCards, setFlippedCards] = useState({});
  const [reviewStats, setReviewStats] = useState({});

  useEffect(() => {
    fetch(`http://localhost:8080/api/decks/${id}`)
      .then(res => res.json())
      .then(setDeck)
      .catch(console.error);
  }, [id]);

  const handleAddCard = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8080/api/decks/${id}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frontText, backText })
    })
    .then(res => res.json())
    .then(updatedDeck => {
      setDeck(updatedDeck);
      setFrontText(''); setBackText('');
    });
  };

  const toggleFlip = (cardId) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Phase 3: Kotlin Spaced Repetition Integration
  const handleReview = (e, cardId, quality) => {
    e.stopPropagation(); // Prevents the card from flipping back over
    
    // Default SM-2 values if the card hasn't been reviewed yet
    const currentStats = reviewStats[cardId] || { repetitions: 0, easeFactor: 2.5, interval: 0 };

    fetch('http://localhost:8081/api/srs/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quality: quality,
        repetitions: currentStats.repetitions,
        easeFactor: currentStats.easeFactor,
        interval: currentStats.interval
      })
    })
    .then(res => res.json())
    .then(newStats => {
      // Save the new calculated interval from Kotlin
      setReviewStats(prev => ({ ...prev, [cardId]: newStats }));
      
      // Give visual feedback to the user
      alert(`Kotlin SM-2 Engine: You will see this card again in ${newStats.interval} day(s)!`);
      toggleFlip(cardId); // Flip it back automatically
    })
    .catch(console.error);
  };

  if (!deck) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 text-xl">Loading deck...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans pb-20">
      <Link to="/" className="inline-block mb-6 px-5 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-sm">
        &larr; Back to Dashboard
      </Link>
      
      <h1 className="text-4xl font-extrabold text-center text-slate-800 mb-3">{deck.title}</h1>
      <p className="text-center text-slate-500 mb-8">{deck.description}</p>
      
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-12">
        <h3 className="text-lg font-bold text-orange-500 mb-4">+ Add Manual Card to Deck</h3>
        <form onSubmit={handleAddCard} className="flex flex-col gap-3">
          <input required placeholder="Front Text (Question)" value={frontText} onChange={e => setFrontText(e.target.value)} className="p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <input required placeholder="Back Text (Answer)" value={backText} onChange={e => setBackText(e.target.value)} className="p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <button type="submit" className="p-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">Add Card</button>
        </form>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {deck.cards.length === 0 ? <p className="text-slate-400 font-medium">No cards in this deck yet. Add one above!</p> : null}
        
        {deck.cards.map(card => (
          <div key={card.id} className="w-80 h-64 [perspective:1000px]">
            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${flippedCards[card.id] ? '[transform:rotateY(180deg)]' : ''}`}>
              
              {/* Front of Card */}
              <div 
                onClick={() => toggleFlip(card.id)}
                className="absolute w-full h-full cursor-pointer bg-white text-slate-800 flex flex-col items-center justify-center p-6 text-center rounded-2xl shadow-md border border-slate-100 [backface-visibility:hidden] hover:shadow-lg transition-shadow"
              >
                <span className="text-lg font-semibold">{card.frontText}</span>
                <span className="text-xs text-slate-400 mt-4 font-normal">Click to reveal</span>
              </div>
              
              {/* Back of Card (with Kotlin SRS controls) */}
              <div className="absolute w-full h-full bg-emerald-50 text-slate-800 flex flex-col items-center justify-between p-6 text-center rounded-2xl shadow-md border border-emerald-100 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div 
                  onClick={() => toggleFlip(card.id)}
                  className="flex-1 flex items-center justify-center w-full cursor-pointer overflow-y-auto"
                >
                  <span className="text-lg font-semibold">{card.backText}</span>
                </div>
                
                {/* Spaced Repetition Quality Buttons */}
                <div className="w-full pt-4 mt-2 border-t border-emerald-200">
                  <p className="text-xs text-emerald-600 font-bold mb-2">How well did you know this?</p>
                  <div className="flex justify-between gap-2">
                    <button onClick={(e) => handleReview(e, card.id, 0)} className="flex-1 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold rounded">Forgot</button>
                    <button onClick={(e) => handleReview(e, card.id, 3)} className="flex-1 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-bold rounded">Hard</button>
                    <button onClick={(e) => handleReview(e, card.id, 4)} className="flex-1 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded">Good</button>
                    <button onClick={(e) => handleReview(e, card.id, 5)} className="flex-1 py-1.5 bg-emerald-200 text-emerald-800 hover:bg-emerald-300 text-xs font-bold rounded">Easy</button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}