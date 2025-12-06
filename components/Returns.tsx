import React, { useState } from 'react';
import { Item, ItemStatus } from '../types';

interface ReturnsProps {
  items: Item[];
  onApproveReturn: (itemId: string) => void;
}

const Returns: React.FC<ReturnsProps> = ({ items, onApproveReturn }) => {
  const [activeView, setActiveView] = useState<'requests' | 'manual'>('requests');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingReturns = items.filter(item => item.status === ItemStatus.PENDING_RETURN);
  const checkedOutItems = items.filter(item => item.status === ItemStatus.CHECKED_OUT);

  const filteredCheckedOut = checkedOutItems.filter(item => 
    item.name.includes(searchTerm) || 
    (item.currentHolder && item.currentHolder.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveView('requests')}
          className={`pb-2 px-4 font-bold transition-colors border-b-4 ${
            activeView === 'requests' 
              ? 'border-yellow-500 text-yellow-700' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          طلبات الإرجاع ({pendingReturns.length})
        </button>
        <button
          onClick={() => setActiveView('manual')}
          className={`pb-2 px-4 font-bold transition-colors border-b-4 ${
            activeView === 'manual' 
              ? 'border-blue-500 text-blue-700' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          إرجاع يدوي مباشر ({checkedOutItems.length})
        </button>
      </div>

      {activeView === 'requests' ? (
        <div className="animate-fade-in space-y-4">
          <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-bold text-yellow-800">طلبات الإرجاع المعلقة</h2>
            <p className="text-yellow-700">هذه القائمة تحتوي على العدد التي طلب المدربون إرجاعها. يرجى معاينة العدة ثم تأكيد الاستلام.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {pendingReturns.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                لا توجد طلبات إرجاع معلقة حالياً
              </div>
            ) : (
              <table className="w-full text-right">
                <thead className="bg-yellow-100 text-yellow-900">
                  <tr>
                    <th className="p-4">اسم العدة</th>
                    <th className="p-4">الفئة</th>
                    <th className="p-4">المدرب</th>
                    <th className="p-4">تاريخ الطلب</th>
                    <th className="p-4">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingReturns.map(item => (
                    <tr key={item.id} className="hover:bg-yellow-50 transition">
                      <td className="p-4 font-bold">{item.name}</td>
                      <td className="p-4 text-gray-600">{item.category}</td>
                      <td className="p-4 text-gray-800">{item.currentHolder}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(item.lastUpdated).toLocaleDateString('ar-SA')}</td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if(confirm('هل تم استلام العدة ومعاينتها؟')) {
                              onApproveReturn(item.id);
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition shadow-sm"
                        >
                          تأكيد الاستلام
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-bold text-blue-800">إرجاع يدوي مباشر</h2>
            <p className="text-blue-700">يمكنك هنا البحث عن أي عدة "معارة" حالياً وتسجيل استلامها (إرجاعها للمستودع) مباشرة دون الحاجة لطلب من المدرب.</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
             <input 
                type="text" 
                placeholder="بحث باسم المدرب أو اسم العدة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-10"
             />
             <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {filteredCheckedOut.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                 {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد عهد خارج المستودع حالياً'}
              </div>
            ) : (
              <table className="w-full text-right">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-4">اسم العدة</th>
                    <th className="p-4">الفئة</th>
                    <th className="p-4">معار إلى (المدرب)</th>
                    <th className="p-4">تاريخ الخروج</th>
                    <th className="p-4">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCheckedOut.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-bold">{item.name}</td>
                      <td className="p-4 text-gray-600">{item.category}</td>
                      <td className="p-4 text-gray-800 font-semibold">{item.currentHolder}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(item.lastUpdated).toLocaleDateString('ar-SA')}</td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if(confirm(`هل أنت متأكد من استرجاع "${item.name}" من المدرب "${item.currentHolder}"؟`)) {
                              onApproveReturn(item.id);
                            }
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
                        >
                          إرجاع للمستودع
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;