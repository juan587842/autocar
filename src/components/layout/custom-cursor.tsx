'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false)
    const [isPointer, setIsPointer] = useState(false)

    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    // Spring setup for smooth follow on the outer ring
    const springConfig = { damping: 25, stiffness: 400, mass: 0.1 }
    // The main dot will use raw values for zero delay, the ring uses spring
    const followerXSpring = useSpring(cursorX, springConfig)
    const followerYSpring = useSpring(cursorY, springConfig)

    useEffect(() => {
        // Check if device has a fine pointer (mouse)
        const hasPointer = window.matchMedia('(pointer: fine)').matches
        if (!hasPointer) return

        setIsVisible(true)

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
        }

        const checkPointer = (e: MouseEvent | Event) => {
            // Usa as coordenadas mais recentes do cursor
            const el = document.elementFromPoint(cursorX.get(), cursorY.get())
            if (!el) return setIsPointer(false)

            const clickableTags = ['a', 'button', 'input', 'select', 'textarea']
            const isClickable = clickableTags.includes(el.tagName.toLowerCase()) ||
                el.closest('a') !== null ||
                el.closest('button') !== null ||
                el.getAttribute('role') === 'button'

            setIsPointer(isClickable)
        }

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mousemove', checkPointer)
        window.addEventListener('scroll', checkPointer)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mousemove', checkPointer)
            window.removeEventListener('scroll', checkPointer)
        }
    }, [cursorX, cursorY])

    if (!isVisible) return null

    return (
        <>
            {/* Principal ponteiro triangular */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[9999]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    rotate: isPointer ? -10 : 0,
                    scale: isPointer ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="var(--color-accent)"
                    stroke="var(--color-bg-primary)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_2px_8px_rgba(255,77,0,0.4)]"
                >
                    <path d="M 0 0 L 7 21 L 11 13 L 20 9 Z" />
                </svg>
            </motion.div>

            {/* Anel seguidor com efeito Glass (Desaparece ao focar) */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-[9998] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 backdrop-blur-[1px]"
                style={{
                    x: followerXSpring,
                    y: followerYSpring,
                    scale: isPointer ? 1.5 : 1,
                    opacity: isPointer ? 0 : 1,
                }}
                transition={{ scale: { duration: 0.2 }, opacity: { duration: 0.2 } }}
            />
        </>
    )
}
