import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [decks, setDecks] = useState([]);
  
  // Manual Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');

  // AI Generator Form State
  const [aiTopic, setAiTopic] = useState('');
  const [aiAuthor, setAiAuthor] = useState('');
  const [aiCardCount, setAiCardCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/decks')
      .then(res => res.json())
      .then(setDecks)
      .catch(console.error);
  }, []);

  const handleCreateDeck = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, author, cards: [] })
    })
    .then(res => res.json())
    .then(newDeck => {
      setDecks([...decks, newDeck]);
      setTitle(''); setDescription(''); setAuthor('');
    });
  };

  const handleAiGenerateDeck = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    // 1. Create empty deck in Java Spring Boot
    fetch('http://localhost:8080/api/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `AI Topic: ${aiTopic}`,
        description: `Auto-generated ${aiCardCount} flashcards.`,
        author: aiAuthor || 'AI Assistant',
        cards: []
      })
    })
    .then(res => res.json())
    .then(createdDeck => {
      // 2. Tell Python to generate dummy cards for this deck
      return fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: aiTopic, 
          numCards: aiCardCount, 
          deckId: createdDeck.id 
        })
      });
    })
    .then(() => fetch('http://localhost:8080/api/decks'))
    .then(res => res.json())
    .then(updatedDecks => {
      setDecks(updatedDecks);
      setAiTopic(''); setAiAuthor('');
      setIsGenerating(false);
    })
    .catch(err => {
      console.error(err);
      setIsGenerating(false);
    });
  };

  const handleDeleteDeck = (e, deckId) => {
    e.preventDefault(); 
    if (!window.confirm("Are you sure you want to delete this study deck?")) return;

    fetch(`http://localhost:8080/api/decks/${deckId}`, {
      method: 'DELETE',
    })
    .then(() => {
      setDecks(decks.filter(deck => deck.id !== deckId));
    })
    .catch(err => console.error("Failed to delete deck:", err));
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pb-20 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16">
        <header className="mb-16 text-center lg:text-left">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight mb-3">
            Active Learning Hub
          </h1>
          <p className="text-slate-500 font-medium text-lg">Master your coursework with manual creation or instant AI generation.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Manual Form */}
          <div className="bg-white/75 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg text-lg">+</span>
              Create Manual Deck
            </h3>
            <form onSubmit={handleCreateDeck} className="flex flex-col gap-4">
              <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 font-medium text-sm" placeholder="Deck Title" />
              <input required value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 font-medium text-sm" placeholder="Author Name" />
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[80px] resize-none text-slate-700 font-medium text-sm" placeholder="Short Description" />
              <button type="submit" className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all text-sm">
                Save Deck
              </button>
            </form>
          </div>

          {/* AI Generator Form (Offline Topic Mode) */}
          <div className="bg-white/75 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-lg text-lg">✨</span>
              AI Topic Auto-Generator
            </h3>
            <form onSubmit={handleAiGenerateDeck} className="flex flex-col gap-4">
              
              <div className="flex gap-4">
                <input required value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="w-full p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-700 font-medium text-sm" placeholder="Enter study topic (e.g., Data Structures)" />
                <input required value={aiAuthor} onChange={e => setAiAuthor(e.target.value)} className="w-1/3 p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-700 font-medium text-sm" placeholder="Author" />
              </div>

              {/* Number of Cards Slider */}
              <div className="flex flex-col gap-1 mt-4">
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Number of Cards: {aiCardCount}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="20" 
                  value={aiCardCount} 
                  onChange={e => setAiCardCount(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <button type="submit" disabled={isGenerating} className="w-full mt-4 p-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-xl shadow-md shadow-purple-200 transition-all text-sm">
                {isGenerating ? 'Generating...' : 'Auto-Generate Deck'}
              </button>
            </form>
          </div>

        </div>

        {/* Deck Grid */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Existing Study Decks</h2>
        {decks.length === 0 ? (
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium">
            No decks found. Create one manually or use the auto-generator.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
              <Link to={`/deck/${deck.id}`} key={deck.id} className="group relative flex flex-col justify-between bg-white p-7 rounded-3xl shadow-md shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1.5 transition-all duration-300">
                <button 
                  onClick={(e) => handleDeleteDeck(e, deck.id)}
                  title="Delete Deck"
                  className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  &times;
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight mb-2 pr-8">{deck.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">{deck.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{deck.author}</span>
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg group-hover:bg-blue-100 transition-colors">
                    {deck.cards ? deck.cards.length : 0} Cards
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}