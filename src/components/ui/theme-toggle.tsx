'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const dark = stored ? stored === 'dark' : prefersDark
        setIsDark(dark)
        document.documentElement.classList.toggle('dark', dark)
    }, [])

    function toggle() {
        const newDark = !isDark
        setIsDark(newDark)
        localStorage.setItem('theme', newDark ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', newDark)
    }

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
            <motion.div
                key={isDark ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
        </button>
    )
}
