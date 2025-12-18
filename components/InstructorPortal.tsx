import React, { useState, useMemo } from 'react';
import { Item, ItemStatus, Instructor } from '../types';

interface InstructorPortalProps {
  items: Item[];
  instructors: Instructor[];
  onManualCheckout: (itemData: {name: string, category: string}, quantity: number, instructorName: string) => void;
  onRequestReturn: (itemId: string, instructorName: string) => void;
  onUpdateInstructor: (instructor: Instructor) => void;
  onCheckout: (itemId: string, instructorName: string, quantity: number) => void;
  onSwitchToSupervisor: () => void;
}

interface GroupedMyItem {
  name: string;
  category: string;
  status: ItemStatus;
  count: number;
  ids: string[];
  lastUpdated: string;
  rejectionReason: string | null;
}

const InstructorPortal: React.FC<InstructorPortalProps> = ({ 
  items, 
  instructors, 
  onManualCheckout, 
  onRequestReturn,
  onUpdateInstructor,
  onCheckout,
  onSwitchToSupervisor
}) => {
  const [currentUser, setCurrentUser] = useState<Instructor | null>(null);
  
  // Login State
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'my-items' | 'request-tool' | 'settings'>('my-items');

  // Request/Checkout/Add State
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '' });
  const [quantity, setQuantity] = useState(1);
  const [selectedCheckoutItemId, setSelectedCheckoutItemId] = useState('');

  // Password Change State
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  // Group items by Name and Category for availability in portal
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

  // Group my current items by name/category/status to merge duplicates
  const groupedMyItems = useMemo(() => {
    if (!currentUser) return [];

    const myItemsRaw = items.filter(
      item => (
        (item.currentHolder === currentUser.name && item.status === ItemStatus.CHECKED_OUT) ||
        (item.currentHolder === currentUser.name && item.status === ItemStatus.PENDING_RETURN)
      )
    );

    const groups: Record<string, GroupedMyItem> = {};

    myItemsRaw.forEach(item => {
      // Key includes status and rejection reason so we don't merge items with different statuses
      const key = `${item.name}-${item.category}-${item.status}-${item.rejectionReason || 'none'}`;
      if (!groups[key]) {
        groups[key] = {
          name: item.name,
          category: item.category,
          status: item.status,
          count: 0,
          ids: [],
          lastUpdated: item.lastUpdated,
          rejectionReason: item.rejectionReason || null
        };
      }
      groups[key].count += 1;
      groups[key].ids.push(item.id);
      
      // Keep the most recent update date
      if (new Date(item.lastUpdated) > new Date(groups[key].lastUpdated)) {
        groups[key].lastUpdated = item.lastUpdated;
      }
    });

    return Object.values(groups);
  }, [items, currentUser]);

  // Load user from local storage on mount
  React.useEffect(() => {
    const savedUserId = localStorage.getItem('makhzan_current_user_id');
    if (savedUserId && instructors.length > 0) {
      const user = instructors.find(i => i.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [instructors]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const instructor = instructors.find(i => i.id === selectedInstructorId);
    
    if (instructor && instructor.password === passwordInput) {
      setCurrentUser(instructor);
      localStorage.setItem('makhzan_current_user_id', instructor.id);
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPasswordInput('');
    setSelectedInstructorId('');
    setLoginError('');
    localStorage.removeItem('makhzan_current_user_id');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (passForm.current !== currentUser.password) {
      setPassMsg({ text: 'كلمة المرور الحالية غير صحيحة', type: 'error' });
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setPassMsg({ text: 'كلمة المرور الجديدة غير متطابقة', type: 'error' });
      return;
    }
    if (passForm.new.length < 4) {
      setPassMsg({ text: 'يجب أن تتكون كلمة المرور من 4 خانات على الأقل', type: 'error' });
      return;
    }

    onUpdateInstructor({
      ...currentUser,
      password: passForm.new
    });
    
    setCurrentUser({ ...currentUser, password: passForm.new });
    setPassForm({ current: '', new: '', confirm: '' });
    setPassMsg({ text: 'تم تغيير كلمة المرور بنجاح', type: 'success' });
  };

  const handleManualCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.category && quantity > 0 && currentUser) {
      onManualCheckout(
        { name: newItem.name, category: newItem.category }, 
        quantity, 
        currentUser.name
      );
      
      setNewItem({ name: '', category: '' });
      setQuantity(1);
      setIsManualEntry(false); 
      alert('تم تسجيل العدة بنجاح وإضافتها إلى عهدتك مباشرة.');
      setActiveTab('my-items');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCheckoutItemId && currentUser) {
      const selectedGroup = availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId);
      
      if (selectedGroup && quantity > selectedGroup.count) {
        alert(`⚠️ عذراً، الكمية المطلوبة غير متوفرة. المتاح حالياً هو (${selectedGroup.count}) فقط.`);
        return;
      }

      onCheckout(selectedCheckoutItemId, currentUser.name, quantity);
      setSelectedCheckoutItemId('');
      setQuantity(1);
      alert('تم استلام العدة بنجاح وإضافتها إلى عهدتك');
      setActiveTab('my-items');
    }
  };

  const handleBulkReturnRequest = (itemGroup: GroupedMyItem) => {
    if (!currentUser) return;
    
    const message = `تنبيه هام:\n\nأنت تطلب إرجاع عدد (${itemGroup.count}) من "${itemGroup.name}".\n\nهل قمت بتسليم هذه الكمية فعلياً للمشرف؟\n\nاضغط 'موافق' فقط إذا تم التسليم الفعلي ليرفع النظام طلب الموافقة للمشرف.`;
    
    if (confirm(message)) {
      // Send individual request for each item ID in the group
      itemGroup.ids.forEach(id => {
        onRequestReturn(id, currentUser.name);
      });
      alert(`تم إرسال طلبات إرجاع لعدد (${itemGroup.count}) قطع.`);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-4 md:mt-10 p-4">
        <div className="flex justify-end mb-4">
            <button 
              onClick={onSwitchToSupervisor}
              className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg shadow-sm"
            >
              🛡️ الذهاب لبوابة المشرفين
            </button>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">بوابة المدربين</h2>
            <p className="text-gray-500 mt-2 text-sm">الرجاء اختيار الاسم وإدخال الرمز السري</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">اسم المدرب</label>
              <select
                required
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">-- اختر الاسم --</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">الرقم السري</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="****"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">الرقم السري الافتراضي: 1234</p>
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold">
                {loginError}
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'my-items', label: 'عهدي الحالية', icon: '🎒' },
    { id: 'request-tool', label: 'طلب صرف / تسجيل', icon: '📥' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap gap-2">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">مرحباً، {currentUser.name}</h2>
          <p className="text-xs md:text-sm text-gray-500">لوحة تحكم المدرب</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
           <button 
             onClick={onSwitchToSupervisor}
             className="flex-1 md:flex-none justify-center text-gray-600 text-xs md:text-sm font-semibold hover:bg-gray-100 px-3 py-2 rounded-lg transition flex items-center gap-1 border border-gray-200"
           >
             🛡️ بوابة المشرفين
           </button>
           <button 
             onClick={handleLogout}
             className="flex-1 md:flex-none justify-center text-red-600 text-xs md:text-sm font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-1 border border-red-100"
           >
             🚪 خروج
           </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-t-lg font-bold transition-all text-sm md:text-base ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-sm translate-y-[1px]' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'my-items' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {groupedMyItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <span className="text-4xl mb-2">👍</span>
              <span>لا توجد عهد مسجلة باسمك حالياً</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[600px] md:min-w-full">
                <thead className="bg-gray-50 text-xs md:text-sm">
                  <tr>
                    <th className="p-2 md:p-4 whitespace-nowrap">اسم العدة (الكمية)</th>
                    <th className="p-2 md:p-4 whitespace-nowrap">الفئة</th>
                    <th className="p-2 md:p-4 whitespace-nowrap">آخر تحديث</th>
                    <th className="p-2 md:p-4 whitespace-nowrap">الحالة</th>
                    <th className="p-2 md:p-4 whitespace-nowrap text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  {groupedMyItems.map((group, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2 md:p-4 font-bold">
                        {group.name} {group.count > 1 && <span className="text-blue-600">({group.count})</span>}
                        {group.rejectionReason && (
                          <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded border border-red-100 font-normal">
                             🛑 تم رفض الإرجاع: {group.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="p-2 md:p-4 text-gray-600">{group.category}</td>
                      <td className="p-2 md:p-4 text-gray-500 whitespace-nowrap">{new Date(group.lastUpdated).toLocaleDateString('ar-SA')}</td>
                      <td className="p-2 md:p-4">
                        {group.status === ItemStatus.PENDING_RETURN ? (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">بانتظار الموافقة</span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">تحت عهدتك</span>
                        )}
                      </td>
                      <td className="p-2 md:p-4 text-center">
                        {group.status === ItemStatus.CHECKED_OUT && (
                          <button
                            onClick={() => handleBulkReturnRequest(group)}
                            className="bg-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm hover:bg-orange-600 transition shadow-sm whitespace-nowrap"
                          >
                            {group.rejectionReason ? 'إعادة طلب الإرجاع' : 'رفع طلب إرجاع'}
                          </button>
                        )}
                        {group.status === ItemStatus.PENDING_RETURN && (
                           <span className="text-gray-400 text-xs italic">تم رفع الطلب</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'request-tool' && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 border-t-4 border-t-blue-500">
          <div className="mb-6 border-b pb-4">
            <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📥</span>
              استلام / صرف عدة
            </h3>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              {isManualEntry 
                ? 'تسجيل عدة جديدة وإضافتها لعهدتك مباشرة' 
                : 'اختر العدة التي تحتاجها من قائمة المخزون المتاح حالياً'}
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input 
                type="checkbox" 
                id="manualMode" 
                checked={isManualEntry} 
                onChange={(e) => {
                  setIsManualEntry(e.target.checked);
                  setQuantity(1);
                }}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="manualMode" className="text-gray-700 text-sm md:text-base font-semibold cursor-pointer select-none">
                العدة غير موجودة في القائمة؟ (تسجيل يدوي واستلام فوري)
              </label>
            </div>
          </div>

          {!isManualEntry ? (
            <form onSubmit={handleCheckoutSubmit} className="space-y-6 max-w-lg animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                    <span>🛠️</span> اختر العدة المطلوبة
                  </label>
                  <select
                    required
                    value={selectedCheckoutItemId}
                    onChange={(e) => {
                      setSelectedCheckoutItemId(e.target.value);
                      setQuantity(1);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">-- اختر من القائمة --</option>
                    {availableItemsGrouped.length === 0 ? (
                      <option disabled>لا توجد معدات متاحة حالياً</option>
                    ) : (
                      availableItemsGrouped.map(group => (
                        <option key={group.item.id} value={group.item.id}>
                          {group.item.name} - ({group.item.category}) [{group.count} متوفر]
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                    <span>🔢</span> الكمية
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none text-center font-bold ${
                      selectedCheckoutItemId && availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId) && quantity > (availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId)?.count || 0)
                      ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-500 bg-white'
                    }`}
                  />
                </div>
              </div>

              {selectedCheckoutItemId && availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId) && quantity > (availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId)?.count || 0) && (
                 <p className="text-xs text-red-600 font-bold animate-pulse">
                   ⚠️ الكمية المطلوبة غير متوفرة بالكامل! المتاح: ({availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId)?.count})
                 </p>
              )}

              <button
                type="submit"
                disabled={!selectedCheckoutItemId || (availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId)?.count || 0) < quantity}
                className={`w-full py-3 rounded-lg font-bold text-lg shadow-md transition-all ${
                  !selectedCheckoutItemId || (availableItemsGrouped.find(g => g.item.id === selectedCheckoutItemId)?.count || 0) < quantity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                تأكيد الاستلام {quantity > 1 ? `(${quantity} قطع)` : ''}
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualCheckoutSubmit} className="space-y-4 max-w-lg animate-fade-in">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4 text-xs md:text-sm text-green-800">
                أنت تقوم الآن بتسجيل عدة جديدة واستلامها فوراً لتصبح تحت عهدتك.
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-semibold flex items-center gap-2">
                  <span>✏️</span> اسم العدة / الجهاز
                </label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="مثال: جهاز قياس، طقم مفكات..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold flex items-center gap-2">
                    <span>📁</span> الفئة
                  </label>
                  <select
                    required
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">-- اختر الفئة --</option>
                    <option value="عدد يدوية">عدد يدوية</option>
                    <option value="أجهزة قياس">أجهزة قياس</option>
                    <option value="معدات ورشة">معدات ورشة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold flex items-center gap-2">
                    <span>🔢</span> الكمية
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md mt-4">
                تسجيل واستلام في عهدتي
              </button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 max-w-lg border-t-4 border-t-slate-500">
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
             <span className="bg-slate-100 text-slate-600 p-2 rounded-lg">🔒</span>
             تغيير الرقم السري
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">الرقم السري الحالي</label>
              <input
                type="password"
                required
                value={passForm.current}
                onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">الرقم السري الجديد</label>
              <input
                type="password"
                required
                value={passForm.new}
                onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">تأكيد الرقم الجديد</label>
              <input
                type="password"
                required
                value={passForm.confirm}
                onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>

            {passMsg.text && (
              <div className={`p-3 rounded-lg text-sm text-center font-bold ${
                passMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {passMsg.text}
              </div>
            )}

            <button type="submit" className="w-full bg-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-md">
              حفظ التغييرات
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InstructorPortal;