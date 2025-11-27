'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import SearchBar from '@/components/SearchBar'
import ChatWindow from '@/components/ChatWindow'
import CompanyCard from '@/components/CompanyCard'
import PersonCard from '@/components/PersonCard'
import styles from './page.module.css'

interface CompanyCardData {
  id: string
  name: string
  industry?: string | null
  description?: string | null
  founded?: string | null
  location?: string | null
  website?: string | null
  linkedin_url?: string | null
  card_type: 'company'
}

interface PersonCardData {
  id: string
  name: string
  designation?: string | null
  company?: string | null
  linkedin_id: string
  linkedin_url: string
  education?: string | null
  experience_years?: number | null
  location?: string | null
  card_type: 'person'
}

type CardData = CompanyCardData | PersonCardData

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Load cards on mount
  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/cards`)
      if (!response.ok) {
        throw new Error('Failed to fetch cards')
      }
      const data = await response.json()
      setCards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error loading cards:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadCards()
      return
    }

    setIsSearching(true)
    try {
      setError(null)
      const response = await fetch(
        `${API_BASE_URL}/api/cards/search?query=${encodeURIComponent(query)}`
      )
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const data = await response.json()
      setCards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      console.error('Error searching:', err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.mainContent} ${isChatOpen ? styles.withChat : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Search</h1>
        </div>

        <div className={styles.searchSection}>
          <SearchBar onSearch={handleSearch} />
          
          {error && (
            <div className={styles.errorState}>
              <p className={styles.errorText}>{error}</p>
              <button onClick={loadCards} className={styles.retryButton}>
                Retry
              </button>
            </div>
          )}

          {(loading || isSearching) && cards.length === 0 && !error && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading cards...</p>
            </div>
          )}

          {!error && (
            <>
              {searchQuery && !isSearching && (
                <p className={styles.resultsInfo}>
                  {cards.length > 0 
                    ? `Found ${cards.length} result${cards.length !== 1 ? 's' : ''} for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`
                  }
                </p>
              )}

              {cards.length > 0 && (
                <div className={styles.cardsGrid}>
                  {cards.map((card, index) => {
                    if (card.card_type === 'company') {
                      const companyCard = card as CompanyCardData
                      return (
                        <CompanyCard
                          key={`company-${companyCard.id}-${index}`}
                          id={companyCard.id}
                          name={companyCard.name}
                          industry={companyCard.industry}
                          description={companyCard.description}
                          founded={companyCard.founded}
                          location={companyCard.location}
                          website={companyCard.website}
                          linkedin_url={companyCard.linkedin_url}
                          card_type="company"
                        />
                      )
                    } else {
                      const personCard = card as PersonCardData
                      return (
                        <PersonCard
                          key={`person-${personCard.id}-${index}`}
                          id={personCard.id}
                          name={personCard.name}
                          designation={personCard.designation}
                          company={personCard.company}
                          linkedin_id={personCard.linkedin_id}
                          linkedin_url={personCard.linkedin_url}
                          education={personCard.education}
                          experienceYears={personCard.experience_years}
                          location={personCard.location}
                          card_type="person"
                        />
                      )
                    }
                  })}
                </div>
              )}

              {!searchQuery && !loading && !isSearching && cards.length === 0 && (
                <div className={styles.emptyState}>
                  <svg 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                    className={styles.emptyIcon}
                  >
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <p className={styles.emptyText}>Start searching to find companies and people</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isChatOpen && (
        <ChatWindow onClose={toggleChat} />
      )}

      <button 
        className={styles.aiFloatingButton}
        onClick={toggleChat}
        aria-label="Open AI Chat"
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path 
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M8 10h.01M12 10h.01M16 10h.01" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

