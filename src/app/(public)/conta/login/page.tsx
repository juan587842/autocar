import Link from 'next/link'
import { CarFront, AlertCircle, ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginCustomer } from './actions'

export const metadata = {
    title: 'Login - Área do Cliente AutoCar',
}

export default async function CustomerLoginPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
        redirect('/conta')
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-[#0A0A0A] overflow-hidden pt-20">
            <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
                <div className="absolute top-10 left-10 w-[40vw] h-[40vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
                <div className="flex flex-col items-center justify-center text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF4D00] to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,77,0,0.4)] mb-4 border border-[#FF4D00]/20">
                        <CarFront className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Área do <span className="text-[#FF4D00]">Cliente</span></h1>
                    <p className="text-white/50 text-sm mt-2">Gerencie suas preferências e agendamentos</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative">
                    <form action={loginCustomer} className="space-y-6">
                        {searchParams?.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 items-start">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">Credenciais inválidas ou conta não encontrada.</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white/60 tracking-wide uppercase px-1">Seu E-mail</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="seuemail@exemplo.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#FF4D00]/50 focus:ring-1 focus:ring-[#FF4D00]/50 outline-none transition-all placeholder:text-white/20"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">Senha</label>
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#FF4D00]/50 focus:ring-1 focus:ring-[#FF4D00]/50 outline-none transition-all font-mono placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-[#FF4D00] to-orange-500 hover:from-orange-500 hover:to-[#FF4D00] border border-[#FF4D00]/50 rounded-xl font-bold text-white transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:shadow-[0_0_30px_rgba(255,77,0,0.5)] flex items-center justify-center gap-2 group">
                            Acessar Minha Conta
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="text-center text-sm text-white/50 pt-2">
                            Ainda não tem conta? Acesso será enviado junto a sua primeira interação com nossa IA.
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
