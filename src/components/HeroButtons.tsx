'use client'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export default function HeroButtons() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetId = e.currentTarget.href.split('#')[1]
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      <div className="flex gap-4">
        <Link href="/category/popular" className="btn-primary">
          Mulai Nonton
        </Link>
        <Link href="/category/popular" className="glass-btn px-6 py-2.5 text-sm font-medium rounded-full">
          Browse Free
        </Link>
      </div>
      <a href="#rows" onClick={handleScroll} className="absolute bottom-10 animate-bounce">
        <ChevronDown size={28} className="text-[var(--color-accent)]" />
      </a>
    </>
  )
}
