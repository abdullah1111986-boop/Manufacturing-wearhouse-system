import React from 'react';
import { Item, ItemStatus } from '../types';

interface InventoryTableProps {
  items: Item[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4">الرقم</th>
              <th className="p-4">اسم الصنف</th>
              <th className="p-4">الفئة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">المدرب الحالي (إن وجد)</th>
              <th className="p-4">آخر تحديث</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{idx + 1}</td>
                <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                <td className="p-4 text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.category}</span>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;