'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './PersonCard.module.css'
import UploadProgress from './UploadProgress'
import NotesModal from './NotesModal'

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
  const [uploadedFiles, setUploadedFiles] = useState<Array<{filename: string, original_filename: string, size: number, uploaded_at: number}>>([])
  const [uploadStatusId, setUploadStatusId] = useState<string | null>(null)
  const [uploadFilename, setUploadFilename] = useState<string>('')
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)

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
      
      // Start tracking progress if status_id is provided
      if (data.status_id) {
        setUploadStatusId(data.status_id)
        setUploadFilename(file.name)
      } else {
        alert('File uploaded successfully!')
      }
      
      // Reload files list after upload
      loadFiles()
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

  // Load files on mount
  useEffect(() => {
    loadFiles()
  }, [id])

  const loadFiles = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/cards/${id}/files`)
      if (response.ok) {
        const data = await response.json()
        setUploadedFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return
    }

    setDeletingFile(filename)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE_URL}/api/cards/${id}/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Reload files list
        loadFiles()
      } else {
        const errorData = await response.json()
        alert(`Failed to delete file: ${errorData.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    } finally {
      setDeletingFile(null)
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
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        cardId={id}
        cardName={name}
      />
      <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.personName}>{name}</h3>
        {company && (
          <div className={styles.company}>{company}</div>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoColumns}>
          <div className={styles.infoColumn}>
            {designation && (
              <div className={styles.designation}>{designation}</div>
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
          <div className={styles.infoColumn}>
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
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.topActions}>
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className={styles.notesButton}
              aria-label="Open notes"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </button>
            <a
              href={linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkedinLink}
              aria-label={`LinkedIn profile for ${name}`}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
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
          </div>
          {uploadedFiles.length > 0 && (
            <div className={styles.uploadedFilesList}>
              {uploadedFiles.map((file) => (
                <div key={file.filename} className={styles.fileItem}>
                  <span className={styles.fileName}>{file.original_filename || file.filename}</span>
                  <button
                    onClick={() => handleDeleteFile(file.filename)}
                    disabled={deletingFile === file.filename}
                    className={styles.deleteFileButton}
                    aria-label={`Delete ${file.original_filename || file.filename}`}
                  >
                    {deletingFile === file.filename ? (
                      <div className={styles.deleteSpinner}></div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

