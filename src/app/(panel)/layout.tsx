import { PanelSidebar } from '@/components/layout/panel-sidebar'
import { PanelHeader } from '@/components/layout/panel-header'
import { PanelBottomBar } from '@/components/layout/panel-bottom-bar'
import PushProvider from '@/components/providers/PushProvider'

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <PushProvider>
            <div className="min-h-screen relative bg-[#0A0A0A] text-white">
                {/* Background Base Effects (Aura) */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#FF4D00]/10 blur-[150px] rounded-full mix-blend-screen" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF4D00]/10 blur-[120px] rounded-full mix-blend-screen" />
                </div>

                <PanelSidebar />
                <PanelBottomBar />

                <div className="lg:pl-64 flex flex-col min-h-screen relative z-10 transition-all">
                    <PanelHeader />

                    <main className="flex-1 pb-20 lg:pb-0">
                        <div className="mx-auto w-full max-w-[100vw] px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </PushProvider>
    )
}

