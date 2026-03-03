import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, Loader2, LogIn } from 'lucide-react'

export function LoginForm() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError('Credenciais inválidas. Verifique seu e-mail e senha.')
                return
            }

            // Sucesso! Redirecionar para o painel
            router.push('/dashboard')
            router.refresh()
        } catch (err) {
            setError('Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleLogin} className="space-y-6 w-full max-w-sm">
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium backdrop-blur-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">
                        E-mail
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                            <Mail className="h-5 w-5" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00]/50 transition-all"
                            placeholder="seu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-medium text-white/70">
                            Senha
                        </label>
                        <a href="#" className="text-xs text-[#FF4D00] hover:text-[#FF4D00]/80 transition-colors">
                            Esqueceu a senha?
                        </a>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00]/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-[#FF4D00] text-white rounded-2xl py-3 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
                {/* Efeito Glow Interno */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Entrando...
                    </>
                ) : (
                    <>
                        <LogIn className="h-5 w-5" />
                        Acessar Painel
                    </>
                )}
            </button>
        </form>
    )
}
