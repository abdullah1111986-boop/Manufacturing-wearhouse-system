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
  
  // State
  const [isManualMode, setIsManualMode] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Group items by Name and Category to show availability counts
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
    
    const instructor = instructors.find(i => i.id === selectedInstructorId);
    if (!instructor) return;
    const instructorName = instructor.name;

    if (isManualMode) {
        if (newItemName && newItemCategory && quantity > 0) {
            onManualCheckout({ name: newItemName, category: newItemCategory }, instructorName, quantity);
            resetForm();
            alert(`تم تسجيل ${quantity} من "${newItemName}" وصرفها للمدرب بنجاح`);
        }
    } else {
        if (selectedItemId) {
            // Find the grouped entry to check if requested quantity is valid
            const selectedGroup = availableItemsGrouped.find(g => g.item.id === selectedItemId);
            
            if (selectedGroup && quantity > selectedGroup.count) {
              alert(`⚠️ فشل تنفيذ الطلب: \n\nالكمية المطلوبة (${quantity}) غير متوفرة في المستودع حالياً. \nالعدد المتاح من "${selectedGroup.item.name}" هو (${selectedGroup.count}) فقط.`);
              return; // Prevent submission
            }
            
            onCheckout(selectedItemId, instructorName, quantity);
            resetForm();
            alert(`✅ تم تنفيذ عملية الصرف بنجاح لمجموع (${quantity}) قطع.`);
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
          <h2 className="text-2xl font-bold text-white mb-1">تسجيل خروج عهدة (استلام)</h2>
          <p className="text-blue-100">يرجى اختيار المدرب والكمية والمعدة من القوائم أدناه</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Instructor Selection */}
          <div>
            <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
              <span>👤</span> اسم المدرب المستلم
            </label>
            <select
                required
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
                <option value="">-- اختر المدرب --</option>
                {instructors.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
            </select>
          </div>

          <hr className="border-gray-100 my-4" />

          {/* Toggle Manual Mode */}
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
             <label htmlFor="checkoutManualMode" className="text-gray-700 font-semibold cursor-pointer select-none text-sm md:text-base">
               العدة غير موجودة في القائمة؟ (إدخال يدوي وصرف فوري)
             </label>
           </div>

          {/* Item Selection / Entry */}
          {!isManualMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                      <span>🛠️</span> المعدة / الجهاز (من المخزون)
                    </label>
                    <select
                      required
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="">-- اختر المعدة من القائمة --</option>
                      {availableItemsGrouped.length === 0 ? (
                          <option disabled>لا توجد معدات متاحة حالياً</option>
                      ) : (
                        availableItemsGrouped.map(group => (
                            <option key={group.item.id} value={group.item.id}>
                              {group.item.name} - {group.item.category} ({group.count} متوفر)
                            </option>
                          ))
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                      <span>🔢</span> كمية العدد
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none text-center font-bold ${
                        selectedItemId && availableItemsGrouped.find(g => g.item.id === selectedItemId) && quantity > (availableItemsGrouped.find(g => g.item.id === selectedItemId)?.count || 0)
                        ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-blue-500 bg-white'
                      }`}
                    />
                  </div>
                </div>
                {selectedItemId && availableItemsGrouped.find(g => g.item.id === selectedItemId) && quantity > (availableItemsGrouped.find(g => g.item.id === selectedItemId)?.count || 0) && (
                   <p className="text-xs text-red-600 font-bold animate-pulse flex items-center gap-1">
                     ⚠️ الكمية المطلوبة تتجاوز المتاح في المخزون!
                   </p>
                )}
              </div>
          ) : (
              <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                      <span>✏️</span> اسم المعدة / الجهاز
                    </label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="مثال: دريل كهربائي جديد..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                        <span>📁</span> الفئة
                      </label>
                      <select
                          required
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      >
                          <option value="">-- اختر الفئة --</option>
                          <option value="عدد يدوية">عدد يدوية</option>
                          <option value="أجهزة قياس">أجهزة قياس</option>
                          <option value="معدات ورشة">معدات ورشة</option>
                          <option value="أخرى">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                        <span>🔢</span> الكمية المصروفة
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-bold"
                      />
                    </div>
                  </div>
              </div>
          )}

          <button
            type="submit"
            disabled={!selectedInstructorId || (!isManualMode && !selectedItemId) || (isManualMode && (!newItemName || !newItemCategory))}
            className={`w-full py-4 rounded-lg font-bold text-lg shadow-md transition-all transform hover:-translate-y-1 ${
              !selectedInstructorId || (!isManualMode && !selectedItemId) || (isManualMode && (!newItemName || !newItemCategory))
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            تأكيد الاستلام {quantity > 1 ? `(${quantity} قطع)` : ''}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;