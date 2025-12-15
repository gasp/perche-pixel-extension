import { type ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
