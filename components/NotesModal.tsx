'use client'

import { useState, useEffect } from 'react'
import styles from './NotesModal.module.css'

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
  cardId: string
  cardName: string
}

export default function NotesModal({ isOpen, onClose, cardId, cardName }: NotesModalProps) {
  const [note, setNote] = useState<string>('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteChanged, setNoteChanged] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadNote()
    }
  }, [isOpen, cardId])

  const loadNote = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/cards/${cardId}/note`)
      if (response.ok) {
        const data = await response.json()
        setNote(data.note || '')
        setNoteChanged(false)
      }
    } catch (error) {
      console.error('Error loading note:', error)
    }
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
    setNoteChanged(true)
  }

  const handleSaveNote = async () => {
    if (!noteChanged) return
    
    setNoteSaving(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/cards/${cardId}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      })
      
      if (response.ok) {
        setNoteChanged(false)
        onClose()
      } else {
        throw new Error('Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note')
    } finally {
      setNoteSaving(false)
    }
  }

  const handleClose = () => {
    if (noteChanged) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        setNoteChanged(false)
        onClose()
      }
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Notes for {cardName}</h3>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Add your notes here..."
            className={styles.notesTextarea}
            rows={10}
          />
        </div>
        <div className={styles.modalFooter}>
          <button
            onClick={handleClose}
            className={styles.cancelButton}
            disabled={noteSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveNote}
            disabled={noteSaving || !noteChanged}
            className={styles.saveButton}
          >
            {noteSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

