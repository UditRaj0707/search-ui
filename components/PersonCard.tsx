'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './PersonCard.module.css'
import UploadProgress from './UploadProgress'

interface PersonCardProps {
  id: string
  name: string
  designation?: string | null
  company?: string | null
  linkedin_id: string
  linkedin_url: string
  education?: string | null
  experienceYears?: number | null
  location?: string | null
  card_type: 'person'
}

export default function PersonCard({
  id,
  name,
  designation,
  company,
  linkedin_id,
  linkedin_url,
  education,
  experienceYears,
  location,
  card_type
}: PersonCardProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploadStatusId, setUploadStatusId] = useState<string | null>(null)
  const [uploadFilename, setUploadFilename] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [note, setNote] = useState<string>('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteChanged, setNoteChanged] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/cards/${id}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadedFiles(prev => [...prev, data.filename])
      
      // Start tracking progress if status_id is provided
      if (data.status_id) {
        setUploadStatusId(data.status_id)
        setUploadFilename(file.name)
      } else {
        alert('File uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleProgressComplete = () => {
    setUploadStatusId(null)
    setUploadFilename('')
  }

  // Load note on mount
  useEffect(() => {
    const loadNote = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_BASE_URL}/api/cards/${id}/note`)
        if (response.ok) {
          const data = await response.json()
          setNote(data.note || '')
        }
      } catch (error) {
        console.error('Error loading note:', error)
      }
    }
    loadNote()
  }, [id])

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
    setNoteChanged(true)
  }

  const handleSaveNote = async () => {
    if (!noteChanged) return
    
    setNoteSaving(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/cards/${id}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      })
      
      if (response.ok) {
        setNoteChanged(false)
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

  return (
    <>
      {uploadStatusId && (
        <UploadProgress
          statusId={uploadStatusId}
          filename={uploadFilename}
          onComplete={handleProgressComplete}
        />
      )}
      <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.personName}>{name}</h3>
        {company && (
          <div className={styles.company}>{company}</div>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.info}>
          {designation && (
            <div className={styles.designation}>{designation}</div>
          )}
          {location && (
            <div className={styles.location}>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {location.split(',')[0]}
            </div>
          )}
          {education && (
            <div className={styles.education}>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M22 10v6M2 10l9-4 9 4-9 4z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              {education}
            </div>
          )}
          {experienceYears !== null && experienceYears !== undefined && (
            <div className={styles.experience}>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {experienceYears.toFixed(1)} years experience
            </div>
          )}
        </div>
        <div className={styles.notesSection}>
          <div className={styles.notesHeader}>
            <label className={styles.notesLabel}>Notes</label>
            {noteChanged && (
              <button
                onClick={handleSaveNote}
                disabled={noteSaving}
                className={styles.saveNoteButton}
              >
                {noteSaving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
          <textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Add your notes here..."
            className={styles.notesTextarea}
            rows={4}
          />
        </div>
        <div className={styles.actions}>
          <a
            href={linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedinLink}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span>{linkedin_id}</span>
          </a>
          <div className={styles.uploadSection}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className={styles.fileInput}
              id={`file-upload-${id}`}
            />
            <label 
              htmlFor={`file-upload-${id}`}
              className={styles.uploadButton}
            >
              {uploading ? (
                <div className={styles.uploadSpinner}></div>
              ) : (
                <>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload
                </>
              )}
            </label>
            {uploadedFiles.length > 0 && (
              <div className={styles.uploadedFiles}>
                {uploadedFiles.length} file(s) uploaded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

