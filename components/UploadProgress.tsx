'use client'

import { useEffect, useState } from 'react'
import styles from './UploadProgress.module.css'

interface UploadProgressProps {
  statusId: string
  filename: string
  onComplete: () => void
}

interface UploadStatus {
  status: string
  progress: number
  message: string
  chunks_total: number
  chunks_indexed: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function UploadProgress({ statusId, filename, onComplete }: UploadProgressProps) {
  const [status, setStatus] = useState<UploadStatus | null>(null)

  useEffect(() => {
    if (!statusId) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/upload/status/${statusId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }
        const data = await response.json()
        setStatus(data)

        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          setTimeout(() => {
            onComplete()
          }, 2000) // Auto-dismiss after 2 seconds
          return
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }

    // Poll immediately, then every 500ms
    pollStatus()
    const interval = setInterval(pollStatus, 500)

    return () => clearInterval(interval)
  }, [statusId, onComplete])

  if (!status) return null

  const isComplete = status.status === 'completed'
  const isFailed = status.status === 'failed'
  const isActive = status.status !== 'completed' && status.status !== 'failed'

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressContent}>
        <div className={styles.progressHeader}>
          <span className={styles.filename}>{filename}</span>
          {isComplete && <span className={styles.successIcon}>✓</span>}
          {isFailed && <span className={styles.errorIcon}>✕</span>}
        </div>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${isComplete ? styles.success : ''} ${isFailed ? styles.error : ''}`}
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <div className={styles.progressInfo}>
          <span className={styles.message}>{status.message}</span>
          {status.chunks_total > 0 && (
            <span className={styles.chunksInfo}>
              {status.chunks_indexed}/{status.chunks_total} chunks
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

