import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout-container" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div className="hf-dash-main">
        {children}
      </div>
    </div>
  );
}

