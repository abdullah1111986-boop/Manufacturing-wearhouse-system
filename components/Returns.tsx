import React, { useState } from 'react';
import { Item, ItemStatus } from '../types';

interface ReturnsProps {
  items: Item[];
  onApproveReturn: (itemId: string) => void;
  onRejectReturn: (itemId: string, reason: string) => void;
}

const Returns: React.FC<ReturnsProps> = ({ items, onApproveReturn, onRejectReturn }) => {
  const [activeView, setActiveView] = useState<'requests' | 'manual'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for rejection logic
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingReturns = items.filter(item => item.status === ItemStatus.PENDING_RETURN);
  const checkedOutItems = items.filter(item => item.status === ItemStatus.CHECKED_OUT);

  const filteredCheckedOut = checkedOutItems.filter(item => 
    item.name.includes(searchTerm) || 
    (item.currentHolder && item.currentHolder.includes(searchTerm))
  );

  const handleRejectClick = (itemId: string) => {
    setRejectingItemId(itemId);
    setRejectionReason('');
  };

  const submitRejection = () => {
    if (rejectingItemId && rejectionReason.trim()) {
      onRejectReturn(rejectingItemId, rejectionReason);
      setRejectingItemId(null);
      setRejectionReason('');
    } else {
      alert('يجب كتابة سبب الرفض');
    }
  };

  const cancelRejection = () => {
    setRejectingItemId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 md:gap-4 border-b border-gray-200 pb-2 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveView('requests')}
          className={`pb-2 px-2 md:px-4 font-bold transition-colors border-b-4 text-sm md:text-base ${
            activeView === 'requests' 
              ? 'border-yellow-500 text-yellow-700' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          طلبات الإرجاع ({pendingReturns.length})
        </button>
        <button
          onClick={() => setActiveView('manual')}
          className={`pb-2 px-2 md:px-4 font-bold transition-colors border-b-4 text-sm md:text-base ${
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
            <h2 className="text-base md:text-lg font-bold text-yellow-800">طلبات الإرجاع المعلقة</h2>
            <p className="text-yellow-700 text-sm md:text-base">هذه القائمة تحتوي على العدد التي طلب المدربون إرجاعها. يرجى معاينة العدة ثم تأكيد الاستلام.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {pendingReturns.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                لا توجد طلبات إرجاع معلقة حالياً
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right min-w-[600px] md:min-w-full">
                  <thead className="bg-yellow-100 text-yellow-900 text-xs md:text-sm">
                    <tr>
                      <th className="p-2 md:p-4">اسم العدة</th>
                      <th className="p-2 md:p-4">الفئة</th>
                      <th className="p-2 md:p-4">المدرب</th>
                      <th className="p-2 md:p-4">تاريخ الطلب</th>
                      <th className="p-2 md:p-4 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                    {pendingReturns.map(item => (
                      <tr key={item.id} className="hover:bg-yellow-50 transition">
                        <td className="p-2 md:p-4 font-bold">{item.name}</td>
                        <td className="p-2 md:p-4 text-gray-600">{item.category}</td>
                        <td className="p-2 md:p-4 text-gray-800">{item.currentHolder}</td>
                        <td className="p-2 md:p-4 text-gray-500 whitespace-nowrap">{new Date(item.lastUpdated).toLocaleDateString('ar-SA')}</td>
                        <td className="p-2 md:p-4">
                          {rejectingItemId === item.id ? (
                            <div className="flex flex-col gap-2 bg-white p-2 rounded shadow-sm border border-red-200 min-w-[200px]">
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="سبب الرفض..."
                                className="w-full p-2 text-xs md:text-sm border border-gray-300 rounded focus:border-red-500 outline-none"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={submitRejection}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 flex-1"
                                >
                                  تأكيد الرفض
                                </button>
                                <button
                                  onClick={cancelRejection}
                                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  if(confirm('هل تم استلام العدة ومعاينتها؟')) {
                                    onApproveReturn(item.id);
                                  }
                                }}
                                className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm hover:bg-green-700 transition shadow-sm whitespace-nowrap"
                              >
                                قبول واستلام
                              </button>
                              <button
                                onClick={() => handleRejectClick(item.id)}
                                className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm hover:bg-red-100 transition shadow-sm whitespace-nowrap"
                              >
                                رفض
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-lg mb-6">
            <h2 className="text-base md:text-lg font-bold text-blue-800">إرجاع يدوي مباشر</h2>
            <p className="text-blue-700 text-sm md:text-base">يمكنك هنا البحث عن أي عدة "معارة" حالياً وتسجيل استلامها (إرجاعها للمستودع) مباشرة دون الحاجة لطلب من المدرب.</p>
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
              <div className="overflow-x-auto">
                <table className="w-full text-right min-w-[600px] md:min-w-full">
                  <thead className="bg-blue-600 text-white text-xs md:text-sm">
                    <tr>
                      <th className="p-2 md:p-4">اسم العدة</th>
                      <th className="p-2 md:p-4">الفئة</th>
                      <th className="p-2 md:p-4">معار إلى (المدرب)</th>
                      <th className="p-2 md:p-4">تاريخ الخروج</th>
                      <th className="p-2 md:p-4">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                    {filteredCheckedOut.map(item => (
                      <tr key={item.id} className="hover:bg-blue-50 transition">
                        <td className="p-2 md:p-4 font-bold">{item.name}</td>
                        <td className="p-2 md:p-4 text-gray-600">{item.category}</td>
                        <td className="p-2 md:p-4 text-gray-800 font-semibold">{item.currentHolder}</td>
                        <td className="p-2 md:p-4 text-gray-500 whitespace-nowrap">{new Date(item.lastUpdated).toLocaleDateString('ar-SA')}</td>
                        <td className="p-2 md:p-4">
                          <button
                            onClick={() => {
                              if(confirm(`هل أنت متأكد من استرجاع "${item.name}" من المدرب "${item.currentHolder}"؟`)) {
                                onApproveReturn(item.id);
                              }
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
                          >
                            إرجاع للمستودع
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;