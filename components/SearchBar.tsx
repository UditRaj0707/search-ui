'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  onSearch: (query: string) => void
}

interface Suggestion {
  text: string;
  type: string;
  id: string;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Ref to detect clicks outside the component
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 1. Auto-Suggest Logic (Debounced)
  useEffect(() => {
    // Hide suggestions if query is too short
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        // Call your Backend API
        const res = await fetch(`http://localhost:8000/api/suggest?query=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error("Auto-suggest error:", error)
      }
    }

    // Wait 300ms after typing stops before calling API (saves performance)
    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  // 2. Click Outside Handler (Closes dropdown when you click away)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(query.trim())
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (text: string) => {
    setQuery(text)
    onSearch(text)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    onSearch('')
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchContainer}>
          <svg 
            className={styles.searchIcon}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit(e)
              }
              if (e.key === 'Escape') {
                setShowSuggestions(false)
              }
            }}
            placeholder="Search by name, company, designation, or education..."
            className={styles.searchInput}
            style={{ paddingRight: query ? '8rem' : '7rem' }}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}

          <button
            type="submit"
            className={styles.searchButton}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </div>
      </form>

      {/* --- DROPDOWN UI --- */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          {suggestions.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSuggestionClick(item.text)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f3f4f6',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <span style={{ fontWeight: 500, color: '#1f2937' }}>{item.text}</span>
              <span style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#f3f4f6', 
                padding: '2px 8px', 
                borderRadius: '4px',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}