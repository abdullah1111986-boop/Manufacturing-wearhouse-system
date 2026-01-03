
import React, { useState, useMemo } from 'react';
import { Item, ItemStatus, Instructor } from '../types';

interface CheckoutProps {
  items: Item[];
  instructors: Instructor[];
  onCheckout: (itemId: string, instructorName: string, quantity: number) => void;
  onManualCheckout: (itemData: {name: string, category: string}, instructorName: string, quantity: number) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, instructors, onCheckout, onManualCheckout }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [quantity, setQuantity] = useState(1);

  const availableItemsGrouped = useMemo(() => {
    const available = items.filter(item => item.status === ItemStatus.AVAILABLE);
    const groups: Record<string, { item: Item; count: number }> = {};
    
    available.forEach(item => {
      const key = `${item.name}-${item.category}`;
      if (!groups[key]) {
        groups[key] = { item, count: 0 };
      }
      groups[key].count += 1;
    });
    
    return Object.values(groups).sort((a, b) => a.item.name.localeCompare(b.item.name));
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // منع الكميات غير المنطقية
    if (quantity <= 0 || quantity > 100) {
      alert("⚠️ خطأ في الكمية: يجب أن تكون الكمية بين 1 و 100");
      return;
    }

    const instructor = instructors.find(i => i.id === selectedInstructorId);
    if (!instructor) return;
    const instructorName = instructor.name;

    // تنظيف النصوص من أي محاولة حقن HTML أو Script
    const cleanName = newItemName.replace(/[<>]/g, '').trim();

    if (isManualMode) {
        if (cleanName && newItemCategory) {
            onManualCheckout({ name: cleanName, category: newItemCategory }, instructorName, quantity);
            resetForm();
            alert(`✅ تم تسجيل ${quantity} من "${cleanName}" بنجاح`);
        }
    } else {
        if (selectedItemId) {
            const selectedGroup = availableItemsGrouped.find(g => g.item.id === selectedItemId);
            if (selectedGroup && quantity > selectedGroup.count) {
              alert(`⚠️ فشل: الكمية المطلوبة غير متوفرة.`);
              return;
            }
            onCheckout(selectedItemId, instructorName, quantity);
            resetForm();
            alert(`✅ تم تنفيذ عملية الصرف بنجاح.`);
        }
    }
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemCategory('');
    setSelectedItemId('');
    setSelectedInstructorId('');
    setQuantity(1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-1">تسجيل خروج عهدة (استلام آمن)</h2>
          <p className="text-blue-100">النظام يدقق في صحة البيانات المدخلة</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
              <span>👤</span> اسم المدرب المستلم
            </label>
            <select
                required
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
                <option value="">-- اختر المدرب --</option>
                {instructors.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
            </select>
          </div>

          <hr className="border-gray-100 my-4" />

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
             <input 
               type="checkbox" 
               id="checkoutManualMode" 
               checked={isManualMode} 
               onChange={(e) => {
                 setIsManualMode(e.target.checked);
                 setQuantity(1); 
               }}
               className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
             />
             <label htmlFor="checkoutManualMode" className="text-gray-700 font-semibold cursor-pointer select-none text-sm">
               إدخال يدوي (تحقق أمني مضاعف)
             </label>
           </div>

          {!isManualMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-bold mb-2">المدة / الجهاز</label>
                    <select
                      required
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- اختر المعدة --</option>
                      {availableItemsGrouped.map(group => (
                          <option key={group.item.id} value={group.item.id}>
                            {group.item.name} ({group.count} متاح)
                          </option>
                      ))}
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
                      onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full p-3 border border-gray-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>
          ) : (
              <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">اسم المعدة</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="يمنع استخدام الرموز البرمجية"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">الفئة</label>
                      <select
                          required
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                          <option value="">-- اختر الفئة --</option>
                          <option value="عدد يدوية">عدد يدوية</option>
                          <option value="أجهزة قياس">أجهزة قياس</option>
                          <option value="معدات ورشة">معدات ورشة</option>
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
                        onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full p-3 border border-gray-300 rounded-lg text-center font-bold"
                      />
                    </div>
                  </div>
              </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            إتمام العملية بأمان
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
