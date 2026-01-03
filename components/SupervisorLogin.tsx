
import React, { useState, useEffect } from 'react';
import { SUPERVISORS } from '../constants';

interface SupervisorLoginProps {
  onLogin: () => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 1000; // 30 ثانية

const SupervisorLogin: React.FC<SupervisorLoginProps> = ({ onLogin }) => {
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isLocked && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1000);
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsLocked(false);
      setAttempts(0);
    }
    return () => clearInterval(timer);
  }, [isLocked, timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    const supervisor = SUPERVISORS.find(s => s.name === selectedSupervisor);

    if (supervisor && supervisor.password === password) {
      onLogin();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setTimeLeft(LOCKOUT_TIME);
        setError(`تم قفل النظام مؤقتاً بسبب محاولات خاطئة متكررة. يرجى الانتظار ${LOCKOUT_TIME/1000} ثانية.`);
      } else {
        setError(`بيانات الدخول غير صحيحة. المحاولات المتبقية: ${MAX_ATTEMPTS - newAttempts}`);
      }
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
          <p className="text-gray-500 mt-2">نظام محمي سيبرانياً</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">اسم المشرف</label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              disabled={isLocked}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none bg-gray-50 disabled:opacity-50"
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
              disabled={isLocked}
              placeholder="أدخل الرقم السري..."
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none bg-gray-50 disabled:opacity-50"
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm font-bold text-center border ${isLocked ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {error} {isLocked && `(${Math.ceil(timeLeft/1000)} ثانية)`}
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || !selectedSupervisor || !password}
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition shadow-lg transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLocked ? 'النظام مقفل حالياً' : 'تسجيل الدخول الآمن'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupervisorLogin;
