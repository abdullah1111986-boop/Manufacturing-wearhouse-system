import React, { useState } from 'react';
import { Item } from '../types';
import InventoryTable from './InventoryTable';
import InventoryManager from './InventoryManager';

interface WarehouseProps {
  items: Item[];
  onAddItem: (item: Omit<Item, 'id' | 'lastUpdated'>, quantity: number) => void;
}

const Warehouse: React.FC<WarehouseProps> = ({ items, onAddItem }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  return (
    <div className="space-y-6">
      {/* Warehouse Header Tabs */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
            activeTab === 'list'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>📦</span>
          <span>جرد المستودع (الكل)</span>
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
            activeTab === 'add'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>➕</span>
          <span>إضافة أصناف جديدة</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {activeTab === 'list' ? (
          <div>
            <div className="mb-4 flex justify-between items-center px-2">
              <h3 className="text-xl font-bold text-gray-800">سجل محتويات المستودع</h3>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                العدد الكلي: {items.length}
              </span>
            </div>
            <InventoryTable items={items} />
          </div>
        ) : (
          <InventoryManager onAddItem={onAddItem} />
        )}
      </div>
    </div>
  );
};

export default Warehouse;