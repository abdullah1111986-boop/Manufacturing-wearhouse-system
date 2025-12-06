import React, { useState } from 'react';
import { Item, ItemStatus, Instructor } from '../types';

interface CheckoutProps {
  items: Item[];
  instructors: Instructor[];
  onCheckout: (itemId: string, instructorName: string) => void;
  onManualCheckout: (itemData: {name: string, category: string}, instructorName: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, instructors, onCheckout, onManualCheckout }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  
  // Manual Entry State
  const [isManualMode, setIsManualMode] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  const availableItems = items.filter(item => item.status === ItemStatus.AVAILABLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find instructor name from ID
    const instructor = instructors.find(i => i.id === selectedInstructorId);
    if (!instructor) return;
    const instructorName = instructor.name;

    if (isManualMode) {
        if (newItemName && newItemCategory) {
            onManualCheckout({ name: newItemName, category: newItemCategory }, instructorName);
            setNewItemName('');
            setNewItemCategory('');
            setSelectedInstructorId('');
            alert('تم تسجيل العدة الجديدة وصرفها بنجاح');
        }
    } else {
        if (selectedItemId) {
            onCheckout(selectedItemId, instructorName);
            setSelectedItemId('');
            setSelectedInstructorId('');
            alert('تم تسجيل عملية الاستلام بنجاح');
        }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-1">تسجيل خروج عهدة (استلام)</h2>
          <p className="text-blue-100">يرجى اختيار المدرب والمعدة من القوائم أدناه</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Instructor Selection */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">اسم المدرب المستلم</label>
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
               onChange={(e) => setIsManualMode(e.target.checked)}
               className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
             />
             <label htmlFor="checkoutManualMode" className="text-gray-700 font-semibold cursor-pointer select-none">
               العدة غير موجودة في القائمة؟ (إدخال يدوي وصرف فوري)
             </label>
           </div>

          {/* Item Selection / Entry */}
          {!isManualMode ? (
              <div>
                <label className="block text-gray-700 font-bold mb-2">المعدة / الجهاز (من المخزون)</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">-- اختر المعدة من القائمة --</option>
                  {availableItems.length === 0 ? (
                      <option disabled>لا توجد معدات متاحة حالياً</option>
                  ) : (
                      availableItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {item.category}
                        </option>
                      ))
                  )}
                </select>
              </div>
          ) : (
              <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">اسم المعدة / الجهاز</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="مثال: دريل كهربائي جديد..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">الفئة</label>
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
            تأكيد الاستلام
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;