import React from 'react';

interface PortalSelectionProps {
  onSelect: (portal: 'supervisor' | 'instructor') => void;
}

const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">نظام عهدة تقنية التصنيع</h1>
        <p className="text-gray-500 text-lg">الرجاء اختيار بوابة الدخول المناسبة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Instructor Portal Card */}
        <button
          onClick={() => onSelect('instructor')}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1 group"
        >
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            👨‍🏫
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">بوابة المدربين</h2>
          <p className="text-gray-500">
            تسجيل الدخول، استعراض العهد، طلب صرف، وإرجاع العدد.
          </p>
        </button>

        {/* Supervisor Portal Card */}
        <button
          onClick={() => onSelect('supervisor')}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1 group"
        >
          <div className="w-20 h-20 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 group-hover:bg-slate-800 group-hover:text-white transition-colors">
            🛡️
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">بوابة المشرفين</h2>
          <p className="text-gray-500">
            إدارة المخزون، الصرف، المرتجعات، التقارير، وإدارة المستخدمين.
          </p>
        </button>
      </div>

      <div className="mt-12 text-gray-400 text-sm">
        جميع الحقوق محفوظة © {new Date().getFullYear()} - تقنية التصنيع
      </div>
    </div>
  );
};

export default PortalSelection;