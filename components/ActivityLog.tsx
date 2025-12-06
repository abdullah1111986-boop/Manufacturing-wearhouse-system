import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface ActivityLogProps {
  transactions: Transaction[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ transactions }) => {
  // Filter States
  const [searchText, setSearchText] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 1. Base Filter: Only show Checkout, Return, and Rejected transactions
  const relevantTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.type === TransactionType.CHECKOUT || 
      t.type === TransactionType.RETURN ||
      t.type === TransactionType.RETURN_REJECTED
    );
  }, [transactions]);

  // 2. Extract unique instructors for dropdown
  const uniqueInstructors = useMemo(() => {
    const names = new Set(relevantTransactions.map(t => t.instructorName));
    return Array.from(names).sort();
  }, [relevantTransactions]);

  // 3. Apply User Filters
  const filteredTransactions = useMemo(() => {
    return relevantTransactions.filter(t => {
      // Search Text (Item Name or Notes)
      const matchesSearch = searchText === '' || 
        t.itemName.toLowerCase().includes(searchText.toLowerCase()) || 
        (t.notes && t.notes.toLowerCase().includes(searchText.toLowerCase()));

      // Instructor Filter
      const matchesInstructor = selectedInstructor === '' || t.instructorName === selectedInstructor;

      // Type Filter
      const matchesType = selectedType === '' || t.type === selectedType;

      // Date Range Filter
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const tDate = new Date(t.timestamp);
        tDate.setHours(0, 0, 0, 0);

        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          if (tDate < from) matchesDate = false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(0, 0, 0, 0);
          if (tDate > to) matchesDate = false;
        }
      }

      return matchesSearch && matchesInstructor && matchesType && matchesDate;
    });
  }, [relevantTransactions, searchText, selectedInstructor, selectedType, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearchText('');
    setSelectedInstructor('');
    setSelectedType('');
    setDateFrom('');
    setDateTo('');
  };

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 no-print">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">سجل حركة العهد</h2>
          <span className="text-xs md:text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600">
             العدد: {filteredTransactions.length}
          </span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none justify-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-xs md:text-sm font-bold shadow-sm"
          >
            <span>📊</span> تصدير Excel
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 md:flex-none justify-center bg-slate-700 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-2 text-xs md:text-sm font-bold shadow-sm"
          >
            <span>🖨️</span> طباعة
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 no-print animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-1">
             <input
               type="text"
               placeholder="🔍 بحث باسم العدة..."
               value={searchText}
               onChange={(e) => setSearchText(e.target.value)}
               className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>

          {/* Instructor Filter */}
          <div>
            <select
              value={selectedInstructor}
              onChange={(e) => setSelectedInstructor(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">👤 كل المدربين</option>
              {uniqueInstructors.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">📋 كل العمليات</option>
              <option value={TransactionType.CHECKOUT}>استلام (خروج)</option>
              <option value={TransactionType.RETURN}>تسليم (رجوع)</option>
              <option value={TransactionType.RETURN_REJECTED}>رفض إرجاع</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              title="من تاريخ"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              title="إلى تاريخ"
            />
          </div>

          {/* Reset Button */}
          <div>
            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 text-gray-600 p-2 rounded-lg text-sm hover:bg-gray-200 transition font-bold"
            >
              🔄 إعادة تعيين
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">لا توجد عمليات تطابق شروط البحث</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px] md:min-w-full">
              <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 text-xs md:text-sm">
                <tr>
                  <th className="p-2 md:p-4">التاريخ</th>
                  <th className="p-2 md:p-4">المدرب</th>
                  <th className="p-2 md:p-4">العملية</th>
                  <th className="p-2 md:p-4">العدة</th>
                  <th className="p-2 md:p-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                     <td className="p-2 md:p-4 text-gray-600 whitespace-nowrap">
                       {new Date(t.timestamp).toLocaleDateString('ar-SA')} 
                       <span className="text-gray-400 block text-[10px] md:text-xs">
                         {new Date(t.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                       </span>
                     </td>
                     <td className="p-2 md:p-4 font-bold text-gray-800">{t.instructorName}</td>
                     <td className="p-2 md:p-4">
                       <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${
                          t.type === TransactionType.CHECKOUT ? 'bg-red-100 text-red-600' : 
                          t.type === TransactionType.RETURN ? 'bg-green-100 text-green-600' :
                          t.type === TransactionType.RETURN_REJECTED ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100'
                       }`}>
                         {t.type}
                       </span>
                     </td>
                     <td className="p-2 md:p-4 text-gray-700">{t.itemName}</td>
                     <td className="p-2 md:p-4 text-gray-500 italic truncate max-w-[150px]">{t.notes || '-'}</td>
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