'use client'

import React from 'react'

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  )
} 