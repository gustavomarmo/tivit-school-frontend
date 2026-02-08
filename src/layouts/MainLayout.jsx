import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar isOpen={sidebarOpen} />

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                
                <main style={{ padding: '20px', flexGrow: 1, overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}