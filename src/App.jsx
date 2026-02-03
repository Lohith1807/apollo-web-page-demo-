import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Shell from './components/dashboard/Shell';
import Dashboard from './components/dashboard/Dashboard';
import Attendance from './components/dashboard/Attendance';
import Classroom from './components/dashboard/Classroom';
import AcademicProfile from './components/dashboard/AcademicProfile';
import Examinations from './components/dashboard/Examinations';
import Results from './components/dashboard/Results';
import ExamControl from './components/dashboard/ExamControl';

// Admin Modules
import AdminApplications from './components/admin/Applications';
import AdminCourseCatalog from './components/admin/CourseCatalog';
import AdminAttendanceTracker from './components/admin/AttendanceTracker';
import AdminGlobalDirectory from './components/admin/GlobalDirectory';
import FacultyAllocation from './components/dashboard/FacultyAllocation';

console.log("App.jsx Starting Execution");

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log("AppContent Render:", { user: user?.email, activeTab });

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    const isAdmin = user?.role === 'admin';
    console.log("Rendering Content for Tab:", activeTab, "isAdmin:", isAdmin);

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'attendance':
        return <Attendance />;
      case 'curriculum':
        return <AdminCourseCatalog />;
      case 'classroom':
        return isAdmin ? <AdminApplications /> : <Classroom />;
      case 'profile':
        return isAdmin ? <AdminAttendanceTracker /> : <AcademicProfile />;
      case 'directory':
        return <AdminGlobalDirectory />;
      case 'exams':
        return <Examinations />;
      case 'results':
        return <Results />;
      case 'exam-control':
        return <ExamControl />;
      case 'faculty-allocation':
        return <FacultyAllocation />;
      case 'calendar':
      case 'help':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
              <LogOut size={40} className="rotate-180" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Module Under Maintenance</h2>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">
                We are currently synchronizing the <strong>{activeTab.toUpperCase()}</strong> module with the main campus servers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-2 bg-apollo-red text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/10"
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Shell>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#fff5f5', border: '2px solid #e33e33', borderRadius: '16px', color: '#e33e33', margin: '20px', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontWeight: '900', fontSize: '24px' }}>PORTAL CRASHED</h2>
          <p style={{ fontWeight: '700' }}>Error: {this.state.error?.toString()}</p>
          <pre style={{ background: '#000', color: '#0f0', padding: '20px', borderRadius: '8px', overflow: 'auto', fontSize: '11px', mt: '20px' }}>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '12px 24px', background: '#e33e33', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900' }}>REBOOT</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
