import React, { useState } from 'react';
import { SUPERVISOR_NAME, WAREHOUSE_KEEPER } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSupervisorLoggedIn: boolean;
  onSupervisorLogout: () => void;
  onSwitchToInstructor: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab,
  isSupervisorLoggedIn,
  onSupervisorLogout,
  onSwitchToInstructor
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navGroups = [
    {
      title: 'العمليات الرئيسية',
      items: [
        { id: 'dashboard', label: 'لوحة المعلومات', icon: '📊', restricted: true },
        { id: 'checkout', label: 'صرف عهدة', icon: '📤', restricted: true },
        { id: 'return', label: 'إدارة المرتجعات', icon: '✅', restricted: true },
      ]
    },
    {
      title: 'إدارة المخزون',
      items: [
        { id: 'warehouse', label: 'المستودع', icon: '🏭', restricted: true },
        { id: 'history', label: 'سجل العمليات', icon: 'clock', restricted: true },
        { id: 'ai', label: 'المساعد الذكي', icon: '🤖', restricted: true },
      ]
    },
    {
      title: 'الإعدادات والمستخدمين',
      items: [
        { id: 'instructors', label: 'إدارة المدربين', icon: '👥', restricted: true },
      ]
    },
    {
      title: 'روابط سريعة',
      items: [
        { id: 'switch-to-instructor', label: 'الذهاب لبوابة المدربين', icon: '👨‍🏫', restricted: false, action: 'switch' },
      ]
    }
  ];

  // Helper to find current label
  const getCurrentLabel = () => {
    for (const group of navGroups) {
      const item = group.items.find(i => i.id === activeTab);
      if (item) return item.label;
    }
    return '';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavClick = (item: any) => {
    if (item.action === 'switch') {
      onSwitchToInstructor();
    } else {
      setActiveTab(item.id);
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-20">
        <div className="font-bold text-lg">نظام العهدة (مشرف)</div>
        <button onClick={toggleSidebar} className="p-2 focus:outline-none">
          {isSidebarOpen ? '✖️' : '☰'}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-30 w-64 bg-slate-800 text-white flex flex-col shadow-lg transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="p-6 text-center border-b border-slate-700 bg-slate-900">
          <h1 className="text-2xl font-bold text-blue-400">تقنية التصنيع</h1>
          <p className="text-xs text-slate-400 mt-1">بوابة المشرفين</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isLocked = item.restricted && !isSupervisorLoggedIn;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        activeTab === item.id && !item.action
                          ? 'bg-blue-600 text-white shadow-md translate-x-1'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg w-6 flex justify-center">
                          {item.icon === 'clock' ? '🕒' : item.icon}
                        </span>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {isLocked && <span className="text-xs text-gray-500">🔒</span>}
                      {item.action === 'switch' && <span className="text-xs text-gray-400">↪️</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 bg-slate-900 text-xs text-slate-400 mt-auto border-t border-slate-700">
          <button 
            onClick={onSupervisorLogout}
            className="w-full mb-4 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white py-2 rounded-lg transition-colors font-bold flex items-center justify-center gap-2"
          >
             <span>🚪</span> القائمة الرئيسية / خروج
          </button>

          <div className="mb-2">
            <span className="block font-bold text-slate-500 mb-1">إشراف:</span>
            {SUPERVISOR_NAME}
          </div>
          <div className="mb-3">
            <span className="block font-bold text-slate-500 mb-1">أمين المستودع:</span>
            {WAREHOUSE_KEEPER}
          </div>
          
          <div className="pt-3 border-t border-slate-800 text-[10px] text-center opacity-70">
            <p className="mb-1">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
            <p className="text-blue-400/80 font-semibold">تطوير: م. عبدالله الزهراني</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-60px)] md:h-screen">
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center z-10 sticky top-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">
               {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.icon === 'clock' 
                 ? '🕒' 
                 : navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.icon}
            </span>
            {getCurrentLabel()}
          </h2>
          <div className="hidden md:block text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;