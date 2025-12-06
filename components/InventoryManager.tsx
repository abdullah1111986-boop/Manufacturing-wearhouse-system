import React, { useState } from 'react';
import { Item, ItemStatus } from '../types';

interface InventoryManagerProps {
  onAddItem: (item: Omit<Item, 'id' | 'lastUpdated'>, quantity: number) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ onAddItem }) => {
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
  });
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.category && quantity > 0) {
      onAddItem({
        name: newItem.name,
        category: newItem.category,
        status: ItemStatus.AVAILABLE,
      }, quantity);
      
      setNewItem({ name: '', category: '' });
      setQuantity(1);
      alert(`تم إضافة ${quantity} قطعة من الصنف بنجاح`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-1">إدارة المخزون (إضافة عدد)</h2>
          <p className="text-indigo-100">خاص بالمشرف وأمين المستودع لإضافة أصناف جديدة للنظام</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">اسم العدة / الجهاز</label>
            <input
              type="text"
              required
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="مثال: مثقاب كهربائي, جهاز قياس..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">التصنيف / الفئة</label>
              <select
                required
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">-- اختر الفئة --</option>
                <option value="عدد يدوية">عدد يدوية</option>
                <option value="أجهزة قياس">أجهزة قياس</option>
                <option value="معدات ورشة">معدات ورشة</option>
                <option value="معدات قص">معدات قص</option>
                <option value="حقائب">حقائب</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">الكمية</label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newItem.name || !newItem.category || quantity < 1}
            className={`w-full py-4 rounded-lg font-bold text-lg shadow-md transition-all transform hover:-translate-y-1 ${
              !newItem.name || !newItem.category || quantity < 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            إضافة للمخزون
          </button>
        </form>
      </div>
    </div>
  );
};

export default InventoryManager;