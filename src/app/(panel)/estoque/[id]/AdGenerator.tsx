'use client'

import { useState } from 'react'
import { Sparkles, Copy, CheckCircle2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'

export function AdGenerator({ vehicleId }: { vehicleId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [adText, setAdText] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const generateAd = async () => {
        setIsLoading(true)
        setIsOpen(true)
        try {
            const res = await fetch('/api/ai/generate-ad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleId })
            })

            if (res.ok) {
                const data = await res.json()
                setAdText(data.text)
            } else {
                setAdText('Erro ao gerar anúncio. Tente novamente mais tarde.')
            }
        } catch (error) {
            setAdText('Erro de conexão ao gerar anúncio.')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(adText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <>
            <button
                onClick={generateAd}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-full font-medium transition-all text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Gerar Anúncio IA</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white leading-tight">Copilot de Vendas</h2>
                                        <p className="text-sm text-white/50">Geração de copy para Marketing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-white/60 animate-pulse">A Inteligência Artificial está escrevendo sua legenda...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-black/50 border border-white/10 rounded-xl p-5 text-white/80 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                                            {adText}
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <Button
                                                variant="secondary"
                                                onClick={copyToClipboard}
                                                className="gap-2 bg-white/10 hover:bg-white/20 border-white/10"
                                            >
                                                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                {copied ? 'Copiado!' : 'Copiar Texto'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
