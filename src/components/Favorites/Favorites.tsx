
import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Favorite {
  id: string;
  title: string;
  url: string;
  icon: string;
}

const Favorites: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('favorites', [
    { 
      id: '1', 
      title: 'Google',
      url: 'https://google.com',
      icon: 'https://www.google.com/favicon.ico'
    },
    { 
      id: '2', 
      title: 'YouTube',
      url: 'https://youtube.com',
      icon: 'https://www.youtube.com/favicon.ico'
    },
    { 
      id: '3', 
      title: 'GitHub',
      url: 'https://github.com',
      icon: 'https://github.com/favicon.ico'
    },
    { 
      id: '4', 
      title: 'Gmail',
      url: 'https://mail.google.com',
      icon: 'https://mail.google.com/favicon.ico'
    },
  ]);

  const [newFavorite, setNewFavorite] = useState<Omit<Favorite, 'id'>>({
    title: '',
    url: '',
    icon: ''
  });

  const handleAddFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFavorite.title || !newFavorite.url) return;
    
    // If icon is not provided, try to use the favicon from the website
    const icon = newFavorite.icon || `${new URL(newFavorite.url).origin}/favicon.ico`;
    
    const newFav: Favorite = {
      id: Date.now().toString(),
      title: newFavorite.title,
      url: newFavorite.url.startsWith('http') ? newFavorite.url : `https://${newFavorite.url}`,
      icon
    };
    
    setFavorites([...favorites, newFav]);
    setNewFavorite({ title: '', url: '', icon: '' });
    setShowAddForm(false);
  };
  
  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };
  
  const handleIconError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // If favicon loading fails, replace with a generic icon
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdsb2JlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0yIDEyaDIwIi8+PHBhdGggZD0iTTEyIDIuMkE4LjA4IDguMDggMCAwIDEgMTIgMjAiLz48cGF0aCBkPSJNMTIgMi4yQTguMDggOC4wOCAwIDAgMCAxMiAyMCIvPjwvc3ZnPg==';
  };
  
  return (
    <div className="glass dark:glass-dark rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Favorites</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          title={showAddForm ? "Cancel" : "Add favorite"}
        >
          {showAddForm ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          )}
        </button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleAddFavorite} className="mb-4 p-3 bg-white/10 rounded-lg">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Title"
              value={newFavorite.title}
              onChange={(e) => setNewFavorite({ ...newFavorite, title: e.target.value })}
              className="w-full p-2 rounded bg-black/20 text-white outline-none placeholder:text-white/60 mb-2"
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="URL"
              value={newFavorite.url}
              onChange={(e) => setNewFavorite({ ...newFavorite, url: e.target.value })}
              className="w-full p-2 rounded bg-black/20 text-white outline-none placeholder:text-white/60 mb-2"
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Icon URL (optional)"
              value={newFavorite.icon}
              onChange={(e) => setNewFavorite({ ...newFavorite, icon: e.target.value })}
              className="w-full p-2 rounded bg-black/20 text-white outline-none placeholder:text-white/60"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            Add Favorite
          </button>
        </form>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {favorites.map((favorite) => (
          <div 
            key={favorite.id}
            className="group relative"
          >
            <a
              href={favorite.url}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 p-1">
                <img 
                  src={favorite.icon} 
                  alt={favorite.title}
                  className="w-6 h-6 object-contain"
                  onError={handleIconError}
                />
              </div>
              <span className="text-sm truncate w-full text-center">{favorite.title}</span>
            </a>
            <button
              onClick={() => handleRemoveFavorite(favorite.id)}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-1 text-white/70 hover:text-white"
              title="Remove favorite"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
