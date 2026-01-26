import { getScreenDesignPosts } from '@/lib/supabase'
import { Header } from '@/components/layout/Header'
import { ScreenDesignsClient } from '@/components/screen-designs/ScreenDesignsClient'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function ScreenDesignsPage() {
  const posts = await getScreenDesignPosts()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="WBS Dashboard"
        subtitle="Whale ERP Project Overview"
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <ScreenDesignsClient initialDesigns={posts} />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t max-w-[1600px] mx-auto px-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Whale ERP WBS Dashboard &copy; 2026
        </p>
        <p className="text-xs mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>
          Built with Next.js, Supabase, Recharts & Framer Motion
        </p>
      </footer>
    </div>
  )
}
