import React, { useState } from 'react';
import { Instructor } from '../types';

interface InstructorManagerProps {
  instructors: Instructor[];
  onAddInstructor: (name: string) => void;
  onDeleteInstructor: (id: string) => void;
  onResetPassword: (id: string) => void;
}

const InstructorManager: React.FC<InstructorManagerProps> = ({ 
  instructors, 
  onAddInstructor, 
  onDeleteInstructor, 
  onResetPassword 
}) => {
  const [newInstructorName, setNewInstructorName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInstructorName.trim()) {
      onAddInstructor(newInstructorName.trim());
      setNewInstructorName('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Add New Instructor Section */}
      <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="bg-purple-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-1">إدارة المدربين</h2>
          <p className="text-purple-100">إضافة مدربين جدد أو تعديل بيانات المدربين الحاليين</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 border-b border-gray-100">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-gray-700 font-bold mb-2">اسم المدرب الجديد</label>
              <input
                type="text"
                required
                value={newInstructorName}
                onChange={(e) => setNewInstructorName(e.target.value)}
                placeholder="مثال: أ. فيصل الحربي"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newInstructorName.trim()}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-md h-[50px]"
            >
              إضافة مدرب
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">* كلمة المرور الافتراضية لأي مدرب جديد هي: <span className="font-bold font-mono">1234</span></p>
        </form>

        {/* List Instructors */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">قائمة المدربين المسجلين ({instructors.length})</h3>
          
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full text-right">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-4">الاسم</th>
                  <th className="p-4">حالة كلمة المرور</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {instructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-purple-50 transition">
                    <td className="p-4 font-bold text-gray-800">{inst.name}</td>
                    <td className="p-4 text-sm">
                      {inst.password === '1234' ? (
                        <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-full text-xs">افتراضية (1234)</span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">تم تغييرها</span>
                      )}
                    </td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من إعادة تعيين كلمة المرور للمدرب ${inst.name} إلى 1234؟`)) {
                            onResetPassword(inst.id);
                          }
                        }}
                        className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-200 transition"
                        title="إعادة تعيين كلمة المرور إلى 1234"
                      >
                        🔄 استعادة كلمة المرور
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`تحذير: هل أنت متأكد من حذف المدرب ${inst.name} من النظام نهائياً؟`)) {
                            onDeleteInstructor(inst.id);
                          }
                        }}
                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition"
                      >
                        🗑️ حذف
                      </button>
                    </td>
                  </tr>
                ))}
                {instructors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400">لا يوجد مدربين مسجلين حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorManager;