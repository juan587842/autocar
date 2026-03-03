'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'

export function HeroBackground() {
    const [mounted, setMounted] = useState(false)
    const { scrollY } = useScroll()

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 50, stiffness: 100, mass: 2 }
    const mouseXSpring = useSpring(mouseX, springConfig)
    const mouseYSpring = useSpring(mouseY, springConfig)

    // Map mouse position to a movement range
    const x1 = useTransform(mouseXSpring, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-30, 30])
    const y1 = useTransform(mouseYSpring, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-30, 30])

    const x2 = useTransform(mouseXSpring, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [40, -40])
    const y2 = useTransform(mouseYSpring, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [40, -40])

    const scrollYTransform1 = useTransform(scrollY, [0, 1000], [0, 200])
    const scrollYTransform2 = useTransform(scrollY, [0, 1000], [0, -150])

    const yCombined1 = useTransform(() => y1.get() + scrollYTransform1.get())
    const yCombined2 = useTransform(() => y2.get() + scrollYTransform2.get())
    const xCombined3 = useTransform(x1, (v) => v * -1.5)
    const yCombined3 = useTransform(() => y1.get() * -1 + scrollYTransform1.get() * 0.5)

    useEffect(() => {
        setMounted(true)

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    if (!mounted) return null

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            {/* Central orange blob */}
            <motion.div
                className="absolute left-[20%] top-[10%] w-[40vw] h-[40vw] rounded-full bg-[#FF4D00] opacity-[0.15] blur-[100px] mix-blend-screen"
                style={{
                    x: x1,
                    y: yCombined1,
                }}
            />

            {/* Secondary blue/purple blob */}
            <motion.div
                className="absolute right-[10%] top-[30%] w-[35vw] h-[35vw] rounded-full bg-[#3B82F6] opacity-[0.15] blur-[120px] mix-blend-screen"
                style={{
                    x: x2,
                    y: yCombined2,
                }}
            />

            {/* Tertiary deep orange blob near bottom */}
            <motion.div
                className="absolute left-[60%] top-[60%] w-[30vw] h-[30vw] rounded-full bg-[#FF6A33] opacity-[0.1] blur-[90px] mix-blend-screen"
                style={{
                    x: xCombined3,
                    y: yCombined3,
                }}
            />
        </div>
    )
}
