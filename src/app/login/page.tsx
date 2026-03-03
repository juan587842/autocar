import Link from 'next/link'
import { CarFront, AlertCircle, ArrowRight } from 'lucide-react'
import { login } from './actions'

export const metadata = {
    title: 'Login - AutoCar Painel',
    description: 'Área restrita de gestão de veículos e clientes.'
}

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#0A0A0A] overflow-hidden">

            {/* Background Ambience (Aura Theme) */}
            <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-black blur-[120px] rounded-full mix-blend-multiply" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">

                {/* Logo / Header */}
                <div className="flex flex-col items-center justify-center text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] mb-4 border border-red-500/20">
                        <CarFront className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold font-heading text-white tracking-tight">AutoCar <span className="text-red-500">Gestão</span></h1>
                    <p className="text-white/50 text-sm mt-2">Acesso restrito ao painel administrativo</p>
                </div>

                {/* Login Box (Glassmorphism) */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                    <form action={login} className="space-y-6">

                        {/* Errors Handling */}
                        {searchParams?.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 items-start">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white/60 tracking-wide uppercase px-1">E-mail Corporativo</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="voce@autocar.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-white/20"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">Senha</label>
                                    <Link href="#" className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">Esqueceu a senha?</Link>
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all font-mono placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 border border-red-500/50 rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 group">
                            Entrar no Painel
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-white/30 mt-8">
                    &copy; {new Date().getFullYear()} AutoCar. Todos os direitos reservados.
                </p>

            </div>
        </div>
    )
}
