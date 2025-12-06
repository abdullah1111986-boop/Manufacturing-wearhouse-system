import React from 'react';
import { Transaction, TransactionType } from '../types';

interface ActivityLogProps {
  transactions: Transaction[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ transactions }) => {
  // Filter transactions to only show relevant types
  const filteredTransactions = transactions.filter(t => 
    t.type === TransactionType.CHECKOUT || 
    t.type === TransactionType.RETURN ||
    t.type === TransactionType.RETURN_REJECTED
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Add BOM for Excel Arabic support
    const BOM = "\uFEFF";
    const headers = ['التاريخ', 'الوقت', 'المدرب', 'نوع العملية', 'اسم العدة', 'ملاحظات'];
    
    const rows = filteredTransactions.map(t => {
      const date = new Date(t.timestamp);
      return [
        date.toLocaleDateString('ar-SA'),
        date.toLocaleTimeString('en-US', { hour12: false }),
        t.instructorName,
        t.type,
        t.itemName,
        t.notes || ''
      ].join(',');
    });

    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_العمليات_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Print Header (Visible only when printing) */}
      <div className="print-header">
        <h1 className="text-2xl font-bold">المملكة العربية السعودية</h1>
        <h2 className="text-xl">المؤسسة العامة للتدريب التقني والمهني</h2>
        <h3 className="text-lg">الكلية التقنية - قسم تقنية التصنيع</h3>
        <h4 className="text-xl font-bold mt-4">تقرير سجل حركة العهد (استلام وتسليم)</h4>
        <p className="text-sm mt-2">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      <div className="flex justify-between items-center mb-4 no-print">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">سجل حركة العهد</h2>
          <span className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600">
             العدد: {filteredTransactions.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-bold shadow-sm"
          >
            <span>📊</span> تصدير Excel
          </button>
          <button 
            onClick={handlePrint}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-2 text-sm font-bold shadow-sm"
          >
            <span>🖨️</span> طباعة التقرير
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">لا توجد عمليات استلام أو تسليم مسجلة حتى الآن</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">المدرب</th>
                  <th className="p-4">العملية</th>
                  <th className="p-4">العدة</th>
                  <th className="p-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                     <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                       {new Date(t.timestamp).toLocaleDateString('ar-SA')} 
                       <span className="text-xs text-gray-400 block">
                         {new Date(t.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                       </span>
                     </td>
                     <td className="p-4 font-bold text-gray-800">{t.instructorName}</td>
                     <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          t.type === TransactionType.CHECKOUT ? 'bg-red-100 text-red-600' : 
                          t.type === TransactionType.RETURN ? 'bg-green-100 text-green-600' :
                          t.type === TransactionType.RETURN_REJECTED ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100'
                       }`}>
                         {t.type}
                       </span>
                     </td>
                     <td className="p-4 text-gray-700">{t.itemName}</td>
                     <td className="p-4 text-gray-500 text-sm italic">{t.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Signature Section for Print */}
      <div className="hidden print:flex justify-between mt-12 pt-8 px-8">
        <div className="text-center">
          <p className="font-bold mb-4">أمين المستودع</p>
          <p>م. سرور العصيمي</p>
          <p className="mt-8">التوقيع: ....................</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-4">رئيس القسم</p>
          <p>م. ياسر الشربي</p>
          <p className="mt-8">التوقيع: ....................</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;