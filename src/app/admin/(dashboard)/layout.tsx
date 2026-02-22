import AdminSidebar from './components/AdminSidebar';
import { Toaster } from 'sonner';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
            <Toaster
                position="top-right"
                theme="light"
                toastOptions={{
                    className: 'bg-white border-2 border-black/5 shadow-2xl rounded-2xl backdrop-blur-xl',
                    style: {
                        padding: '16px',
                        gap: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        color: '#000000',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                    },
                    classNames: {
                        toast: 'group',
                        title: 'text-black font-black text-sm uppercase tracking-wide',
                        description: 'text-gray-600 font-medium',
                        actionButton: 'bg-black text-white rounded-lg',
                        cancelButton: 'bg-gray-100 text-black rounded-lg',
                    }
                }}
            />

            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-auto relative">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
