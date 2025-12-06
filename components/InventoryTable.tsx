import React, { useState } from 'react';
import { Item, ItemStatus } from '../types';

interface InventoryTableProps {
  items: Item[];
  onUpdate?: (id: string, data: Partial<Item>) => void;
  onDelete?: (id: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '' });

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, category: item.category });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', category: '' });
  };

  const saveEdit = (id: string) => {
    if (onUpdate && editForm.name && editForm.category) {
      onUpdate(id, editForm);
      setEditingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const BOM = "\uFEFF";
    const headers = ['اسم الصنف', 'الفئة', 'الحالة', 'المدرب الحالي', 'تاريخ التحديث'];
    
    const rows = items.map(item => [
        item.name,
        item.category,
        item.status,
        item.currentHolder || '-',
        new Date(item.lastUpdated).toLocaleDateString('ar-SA')
    ].join(','));

    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `جرد_المستودع_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Print Header */}
      <div className="print-header">
        <h1 className="text-2xl font-bold">المملكة العربية السعودية</h1>
        <h2 className="text-xl">المؤسسة العامة للتدريب التقني والمهني</h2>
        <h3 className="text-lg">الكلية التقنية - قسم تقنية التصنيع</h3>
        <h4 className="text-xl font-bold mt-4">تقرير جرد المستودع الشامل</h4>
        <p className="text-sm mt-2">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      <div className="flex justify-end gap-2 mb-2 no-print">
        <button 
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition flex items-center gap-2 text-xs font-bold"
        >
          <span>📊</span> تصدير Excel
        </button>
        <button 
          onClick={handlePrint}
          className="bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition flex items-center gap-2 text-xs font-bold"
        >
          <span>🖨️</span> طباعة القائمة
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 w-12">#</th>
                <th className="p-4">اسم الصنف</th>
                <th className="p-4">الفئة</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">المدرب الحالي</th>
                <th className="p-4">آخر تحديث</th>
                {(onUpdate || onDelete) && <th className="p-4 text-center no-print">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{idx + 1}</td>
                  
                  {/* Name Column */}
                  <td className="p-4 font-semibold text-gray-800">
                    {editingId === item.id ? (
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    ) : (
                      item.name
                    )}
                  </td>

                  {/* Category Column */}
                  <td className="p-4 text-gray-600">
                    {editingId === item.id ? (
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                      >
                        <option value="عدد يدوية">عدد يدوية</option>
                        <option value="أجهزة قياس">أجهزة قياس</option>
                        <option value="معدات ورشة">معدات ورشة</option>
                        <option value="معدات قص">معدات قص</option>
                        <option value="حقائب">حقائب</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    ) : (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.category}</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === ItemStatus.AVAILABLE 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{item.currentHolder || '-'}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(item.lastUpdated).toLocaleDateString('ar-SA')}
                  </td>

                  {/* Actions Column */}
                  {(onUpdate || onDelete) && (
                    <td className="p-4 text-center no-print">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === item.id ? (
                          <>
                            <button 
                              onClick={() => saveEdit(item.id)}
                              className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 transition"
                              title="حفظ"
                            >
                              💾
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 transition"
                              title="إلغاء"
                            >
                              ❌
                            </button>
                          </>
                        ) : (
                          <>
                            {onUpdate && (
                              <button 
                                onClick={() => startEdit(item)}
                                className="bg-blue-50 text-blue-600 p-2 rounded hover:bg-blue-100 transition"
                                title="تعديل"
                              >
                                ✏️
                              </button>
                            )}
                            {onDelete && (
                              <button 
                                onClick={() => {
                                  if(confirm('هل أنت متأكد من حذف هذا الصنف من المستودع نهائياً؟')) {
                                    onDelete(item.id);
                                  }
                                }}
                                className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 transition"
                                title="حذف"
                              >
                                🗑️
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default InventoryTable;