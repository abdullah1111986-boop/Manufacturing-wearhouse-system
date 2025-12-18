import React, { useState, useMemo } from 'react';
import { Item, ItemStatus } from '../types';

interface InventoryTableProps {
  items: Item[];
  onUpdate?: (id: string, data: Partial<Item>) => void;
  onDelete?: (id: string) => void;
}

interface GroupedInventoryItem {
  name: string;
  category: string;
  total: number;
  available: number;
  checkedOut: number;
  pending: number;
  ids: string[];
  lastUpdated: string;
  holders: string[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onUpdate, onDelete }) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '' });

  // Group items by Name and Category
  const groupedItems = useMemo(() => {
    const groups: Record<string, GroupedInventoryItem> = {};

    items.forEach(item => {
      const key = `${item.name}-${item.category}`;
      if (!groups[key]) {
        groups[key] = {
          name: item.name,
          category: item.category,
          total: 0,
          available: 0,
          checkedOut: 0,
          pending: 0,
          ids: [],
          lastUpdated: item.lastUpdated,
          holders: []
        };
      }

      groups[key].total += 1;
      groups[key].ids.push(item.id);
      
      if (item.status === ItemStatus.AVAILABLE) groups[key].available += 1;
      if (item.status === ItemStatus.CHECKED_OUT) groups[key].checkedOut += 1;
      if (item.status === ItemStatus.PENDING_RETURN) groups[key].pending += 1;
      
      if (item.currentHolder && !groups[key].holders.includes(item.currentHolder)) {
        groups[key].holders.push(item.currentHolder);
      }

      if (new Date(item.lastUpdated) > new Date(groups[key].lastUpdated)) {
        groups[key].lastUpdated = item.lastUpdated;
      }
    });

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const startEdit = (group: GroupedInventoryItem) => {
    setEditingKey(`${group.name}-${group.category}`);
    setEditForm({ name: group.name, category: group.category });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditForm({ name: '', category: '' });
  };

  const saveEdit = (ids: string[]) => {
    if (onUpdate && editForm.name && editForm.category) {
      // Update all items in this group
      ids.forEach(id => {
        onUpdate(id, editForm);
      });
      setEditingKey(null);
    }
  };

  const handleDeleteGroup = (ids: string[], name: string) => {
    if (onDelete && confirm(`تحذير: هل أنت متأكد من حذف جميع القطع (${ids.length}) من صنف "${name}" نهائياً؟`)) {
      ids.forEach(id => {
        onDelete(id);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const BOM = "\uFEFF";
    const headers = ['اسم الصنف', 'الفئة', 'الكمية الإجمالية', 'المتوفر', 'خارج المستودع', 'تاريخ التحديث'];
    
    const rows = groupedItems.map(group => [
        group.name,
        group.category,
        group.total,
        group.available,
        group.checkedOut + group.pending,
        new Date(group.lastUpdated).toLocaleDateString('ar-SA')
    ].join(','));

    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `جرد_المستودع_المجمع_${new Date().toISOString().split('T')[0]}.csv`);
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
        <h4 className="text-xl font-bold mt-4">تقرير جرد المستودع الشامل (ملخص الأصناف)</h4>
        <p className="text-sm mt-2">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      <div className="flex justify-end gap-2 mb-2 no-print">
        <button 
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition flex items-center gap-2 text-xs font-bold shadow-sm"
        >
          <span>📊</span> تصدير Excel
        </button>
        <button 
          onClick={handlePrint}
          className="bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition flex items-center gap-2 text-xs font-bold shadow-sm"
        >
          <span>🖨️</span> طباعة القائمة
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[700px] md:min-w-full">
            <thead className="bg-slate-800 text-white text-xs md:text-sm">
              <tr>
                <th className="p-2 md:p-4 w-10 md:w-12">#</th>
                <th className="p-2 md:p-4">اسم الصنف</th>
                <th className="p-2 md:p-4">الفئة</th>
                <th className="p-2 md:p-4 text-center">الكمية المتوفرة</th>
                <th className="p-2 md:p-4 text-center">خارج المستودع</th>
                <th className="p-2 md:p-4 text-center">الإجمالي</th>
                <th className="p-2 md:p-4 whitespace-nowrap">آخر تحديث</th>
                {(onUpdate || onDelete) && <th className="p-2 md:p-4 text-center no-print">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {groupedItems.map((group, idx) => {
                const isEditing = editingKey === `${group.name}-${group.category}`;
                
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 md:p-4 text-gray-500">{idx + 1}</td>
                    
                    {/* Name Column */}
                    <td className="p-2 md:p-4 font-semibold text-gray-800">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full p-1.5 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs"
                        />
                      ) : (
                        group.name
                      )}
                    </td>

                    {/* Category Column */}
                    <td className="p-2 md:p-4 text-gray-600">
                      {isEditing ? (
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          className="w-full p-1.5 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-xs"
                        >
                          <option value="عدد يدوية">عدد يدوية</option>
                          <option value="أجهزة قياس">أجهزة قياس</option>
                          <option value="معدات ورشة">معدات ورشة</option>
                          <option value="معدات قص">معدات قص</option>
                          <option value="حقائب">حقائب</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      ) : (
                        <span className="bg-gray-100 px-2 py-1 rounded text-[10px] md:text-xs">{group.category}</span>
                      )}
                    </td>

                    {/* Available Quantity */}
                    <td className="p-2 md:p-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        group.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'
                      }`}>
                        {group.available}
                      </span>
                    </td>

                    {/* Out Quantity */}
                    <td className="p-2 md:p-4 text-center">
                       <div className="flex flex-col items-center">
                          <span className={`font-bold ${group.checkedOut + group.pending > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                            {group.checkedOut + group.pending}
                          </span>
                          {group.pending > 0 && (
                            <span className="text-[9px] text-yellow-600 font-bold bg-yellow-50 px-1 rounded">({group.pending} بانتظار إرجاع)</span>
                          )}
                       </div>
                    </td>

                    {/* Total Quantity */}
                    <td className="p-2 md:p-4 text-center font-bold text-slate-700">
                      {group.total}
                    </td>

                    <td className="p-2 md:p-4 text-gray-500 whitespace-nowrap">
                      {new Date(group.lastUpdated).toLocaleDateString('ar-SA')}
                    </td>

                    {/* Actions Column */}
                    {(onUpdate || onDelete) && (
                      <td className="p-2 md:p-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => saveEdit(group.ids)}
                                className="bg-green-100 text-green-700 p-1.5 md:p-2 rounded hover:bg-green-200 transition"
                                title="حفظ التعديل للكل"
                              >
                                💾
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="bg-gray-100 text-gray-700 p-1.5 md:p-2 rounded hover:bg-gray-200 transition"
                                title="إلغاء"
                              >
                                ❌
                              </button>
                            </>
                          ) : (
                            <>
                              {onUpdate && (
                                <button 
                                  onClick={() => startEdit(group)}
                                  className="bg-blue-50 text-blue-600 p-1.5 md:p-2 rounded hover:bg-blue-100 transition"
                                  title="تعديل بيانات الصنف"
                                >
                                  ✏️
                                </button>
                              )}
                              {onDelete && (
                                <button 
                                  onClick={() => handleDeleteGroup(group.ids, group.name)}
                                  className="bg-red-50 text-red-600 p-1.5 md:p-2 rounded hover:bg-red-100 transition"
                                  title="حذف الصنف بالكامل"
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
                );
              })}
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