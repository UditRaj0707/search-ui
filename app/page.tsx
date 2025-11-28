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

interface NoteData {
  id: string
  card_id: string
  card_type: string
  note: string
  parent_card?: {
    id: string
    name: string
    type: string
  }
}

interface DocumentData {
  id: string
  card_id: string
  filename: string
  chunk_index: number
  content_preview: string
  score: number
  highlights?: any
  parent_card: {
    id: string
    name: string
    type: string
  }
}

interface SearchResults {
  companies: CompanyCardData[]
  persons: PersonCardData[]
  notes: NoteData[]
  documents: DocumentData[]
}

type TabType = 'companies' | 'persons' | 'notes' | 'documents'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('companies')
  const [searchResults, setSearchResults] = useState<SearchResults>({
    companies: [],
    persons: [],
    notes: [],
    documents: []
  })
  const [defaultCards, setDefaultCards] = useState<CardData[]>([])
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
      setDefaultCards(data)
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
      setSearchResults({ companies: [], persons: [], notes: [], documents: [] })
      setActiveTab('companies')
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
      const data: SearchResults = await response.json()
      setSearchResults(data)
      // Set active tab to first tab with results
      if (data.companies.length > 0) {
        setActiveTab('companies')
      } else if (data.persons.length > 0) {
        setActiveTab('persons')
      } else if (data.notes.length > 0) {
        setActiveTab('notes')
      } else if (data.documents.length > 0) {
        setActiveTab('documents')
      }
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

          {(loading || isSearching) && !searchQuery && defaultCards.length === 0 && !error && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading cards...</p>
            </div>
          )}

          {!error && (
            <>
              {searchQuery ? (
                <>
                  {/* Tabs */}
                  <div className={styles.tabs}>
                    <button
                      className={`${styles.tab} ${activeTab === 'companies' ? styles.activeTab : ''}`}
                      onClick={() => setActiveTab('companies')}
                    >
                      Companies ({searchResults.companies.length})
                    </button>
                    <button
                      className={`${styles.tab} ${activeTab === 'persons' ? styles.activeTab : ''}`}
                      onClick={() => setActiveTab('persons')}
                    >
                      Persons ({searchResults.persons.length})
                    </button>
                    <button
                      className={`${styles.tab} ${activeTab === 'notes' ? styles.activeTab : ''}`}
                      onClick={() => setActiveTab('notes')}
                    >
                      Notes ({searchResults.notes.length})
                    </button>
                    <button
                      className={`${styles.tab} ${activeTab === 'documents' ? styles.activeTab : ''}`}
                      onClick={() => setActiveTab('documents')}
                    >
                      Documents ({searchResults.documents.length})
                    </button>
                  </div>

                  {/* Tab Content */}
                  {!isSearching && (
                    <div className={styles.tabContent}>
                      {activeTab === 'companies' && (
                        <div className={styles.cardsGrid}>
                          {searchResults.companies.length > 0 ? (
                            searchResults.companies.map((card, index) => (
                              <CompanyCard
                                key={`company-${card.id}-${index}`}
                                id={card.id}
                                name={card.name}
                                industry={card.industry}
                                description={card.description}
                                founded={card.founded}
                                location={card.location}
                                website={card.website}
                                linkedin_url={card.linkedin_url}
                                card_type="company"
                              />
                            ))
                          ) : (
                            <p className={styles.noResults}>No companies found</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'persons' && (
                        <div className={styles.cardsGrid}>
                          {searchResults.persons.length > 0 ? (
                            searchResults.persons.map((card, index) => (
                              <PersonCard
                                key={`person-${card.id}-${index}`}
                                id={card.id}
                                name={card.name}
                                designation={card.designation}
                                company={card.company}
                                linkedin_id={card.linkedin_id}
                                linkedin_url={card.linkedin_url}
                                education={card.education}
                                experienceYears={card.experience_years}
                                location={card.location}
                                card_type="person"
                              />
                            ))
                          ) : (
                            <p className={styles.noResults}>No persons found</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'notes' && (
                        <div className={styles.notesList}>
                          {searchResults.notes.length > 0 ? (
                            searchResults.notes.map((note, index) => (
                              <div key={`note-${note.id}-${index}`} className={styles.noteCard}>
                                <div className={styles.noteHeader}>
                                  <span className={styles.noteCardType}>
                                    {note.parent_card?.type === 'company' ? '🏢' : '👤'} {note.parent_card?.name || note.card_id}
                                  </span>
                                </div>
                                <div className={styles.noteContent}>{note.note}</div>
                              </div>
                            ))
                          ) : (
                            <p className={styles.noResults}>No notes found</p>
                          )}
                        </div>
                      )}

                      {activeTab === 'documents' && (
                        <div className={styles.documentsList}>
                          {searchResults.documents.length > 0 ? (
                            searchResults.documents.map((doc, index) => (
                              <div key={`doc-${doc.id}-${index}`} className={styles.documentCard}>
                                <div className={styles.documentHeader}>
                                  <span className={styles.documentFilename}>📄 {doc.filename}</span>
                                  <span className={styles.documentCardType}>
                                    {doc.parent_card.type === 'company' ? '🏢' : '👤'} {doc.parent_card.name}
                                  </span>
                                </div>
                                <div className={styles.documentPreview}>{doc.content_preview}</div>
                                {doc.highlights && Object.keys(doc.highlights).length > 0 && (
                                  <div className={styles.documentHighlights}>
                                    {Object.entries(doc.highlights).map(([field, highlights]: [string, any]) => (
                                      <div key={field}>
                                        {highlights.map((hl: string, i: number) => (
                                          <span key={i} dangerouslySetInnerHTML={{ __html: hl }} />
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className={styles.noResults}>No documents found</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Default cards when no search */}
                  {defaultCards.length > 0 && (
                    <div className={styles.cardsGrid}>
                      {defaultCards.map((card, index) => {
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

                  {!loading && !isSearching && defaultCards.length === 0 && (
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

