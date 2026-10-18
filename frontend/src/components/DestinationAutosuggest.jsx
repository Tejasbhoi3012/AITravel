import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';
import { searchPlaces } from '../services/placesService';

const DestinationAutosuggest = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search destinations...',
  iconSize = 14,
  iconColor = '#3f3f46',
  iconClass = '',
  wrapClass = 'dest-autosuggest-wrap',
  boxClass = '',
  inputClass = '',
  renderRight = null,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const timerRef = useRef(null);
  const seqRef = useRef(0);
  const selectRef = useRef(onSelect);

  useEffect(() => {
    selectRef.current = onSelect;
  });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const closeSuggestions = () => {
    clearTimeout(timerRef.current);
    seqRef.current += 1;
    setShowSuggestions(false);
    setIsSearching(false);
    setHighlightIndex(-1);
  };

  const handleChange = (next) => {
    onChange(next);
    const seq = ++seqRef.current;
    clearTimeout(timerRef.current);
    setHighlightIndex(-1);
    const query = next.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setShowSuggestions(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchPlaces(query);
        if (seq !== seqRef.current) return;
        setSuggestions((data.places || []).slice(0, 6));
        setIsSearching(false);
      } catch {
        if (seq !== seqRef.current) return;
        setSuggestions([]);
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelect = (place) => {
    clearTimeout(timerRef.current);
    seqRef.current += 1;
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSearching(false);
    setHighlightIndex(-1);
    selectRef.current(place);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  const handleFocus = () => {
    if (value.trim().length >= 2 && suggestions.length > 0) setShowSuggestions(true);
  };

  return (
    <div className={wrapClass}>
      <div className={boxClass}>
        <MapPin size={iconSize} color={iconColor} className={iconClass} />
        <input
          type="text"
          className={inputClass}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={closeSuggestions}
          placeholder={placeholder}
          autoComplete="off"
        />
        {renderRight}
      </div>

      {showSuggestions && value.trim().length >= 2 && (
        <div className="dest-suggestions">
          {isSearching && suggestions.length === 0 ? (
            <div className="dest-suggestion-status mono">
              <Loader2 size={13} className="dest-spin" /> QUERYING GEO-INDEX…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="dest-suggestion-status mono">
              <Search size={13} /> NO MATCHING DESTINATIONS — TRY A CITY OR COUNTRY
            </div>
          ) : (
            suggestions.map((place, idx) => (
              <div
                key={place.placeId || `${place.name}-${idx}`}
                className={`dest-suggestion-item ${idx === highlightIndex ? 'active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(place)}
              >
                <MapPin size={14} color="#7c3aed" />
                <div className="dest-suggestion-text">
                  <div className="dest-suggestion-name">{place.name}</div>
                  <div className="dest-suggestion-meta mono">
                    {place.country ? `${place.country} • ` : ''}
                    {place.formattedAddress || 'GEO NODE'}
                    {typeof place.rating === 'number' && place.rating > 0 ? ` • ★ ${place.rating}` : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DestinationAutosuggest;
