import React, { useState } from 'react';
import { SUPERVISORS } from '../constants';

interface SupervisorLoginProps {
  onLogin: () => void;
}

const SupervisorLogin: React.FC<SupervisorLoginProps> = ({ onLogin }) => {
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const supervisor = SUPERVISORS.find(s => s.name === selectedSupervisor);

    if (supervisor && supervisor.password === password) {
      onLogin();
    } else {
      setError('بيانات الدخول غير صحيحة. الرجاء التأكد من الاسم والرقم السري.');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-slate-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🛡️
          </div>
          <h2 className="text-2xl font-bold text-gray-800">دخول المشرفين</h2>
          <p className="text-gray-500 mt-2">هذه المنطقة مقيدة بصلاحيات إدارية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">اسم المشرف</label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none bg-gray-50"
            >
              <option value="">-- اختر الاسم --</option>
              {SUPERVISORS.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">الرقم السري</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل الرقم السري..."
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none bg-gray-50"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition shadow-lg transform active:scale-95"
          >
            تسجيل الدخول
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          نظام إدارة العهدة - تقنية التصنيع
        </div>
      </div>
    </div>
  );
};

export default SupervisorLogin;