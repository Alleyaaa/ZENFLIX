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
        top: targetElement.offsetTop - 80, // Adjust offset for header
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      <div className="flex gap-4">
        <Link href="/category/popular" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 hover:scale-105 transition-all text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
          Mulai Nonton
        </Link>
        <a href="#trending" onClick={handleScroll} className="px-6 py-2.5 rounded-full glass-ios hover:bg-white/[0.08] transition-all text-sm font-semibold text-white/80">
          Browse Free
        </a>
      </div>
      <a href="#trending" onClick={handleScroll} className="absolute bottom-10 animate-bounce">
        <ChevronDown size={28} className="text-white/30" />
      </a>
    </>
  )
}
