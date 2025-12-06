import React, { useState } from 'react';
import { Item, ItemStatus, Instructor } from '../types';

interface InstructorPortalProps {
  items: Item[];
  instructors: Instructor[];
  onManualCheckout: (itemData: {name: string, category: string}, quantity: number, instructorName: string) => void;
  onRequestReturn: (itemId: string, instructorName: string) => void;
  onUpdateInstructor: (instructor: Instructor) => void;
  onCheckout: (itemId: string, instructorName: string) => void;
  onSwitchToSupervisor: () => void;
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

  // Load user from local storage on mount if available
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

  // Handler for manual checkout (Instructor adding item to their custody)
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
      onCheckout(selectedCheckoutItemId, currentUser.name);
      setSelectedCheckoutItemId('');
      alert('تم استلام العدة بنجاح وإضافتها إلى عهدتك');
      setActiveTab('my-items');
    }
  };

  const myItems = items.filter(
    item => currentUser && (
      (item.currentHolder === currentUser.name && item.status === ItemStatus.CHECKED_OUT) ||
      (item.currentHolder === currentUser.name && item.status === ItemStatus.PENDING_RETURN)
    )
  );

  const availableItems = items.filter(item => item.status === ItemStatus.AVAILABLE);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4">
        <div className="flex justify-end mb-4">
            <button 
              onClick={onSwitchToSupervisor}
              className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg shadow-sm"
            >
              🛡️ الذهاب لبوابة المشرفين
            </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
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
          <h2 className="text-xl font-bold text-gray-800">مرحباً، {currentUser.name}</h2>
          <p className="text-sm text-gray-500">لوحة تحكم المدرب</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={onSwitchToSupervisor}
             className="text-gray-600 text-sm font-semibold hover:bg-gray-100 px-3 py-1 rounded-lg transition flex items-center gap-1 border border-gray-200"
           >
             🛡️ بوابة المشرفين
           </button>
           <button 
             onClick={handleLogout}
             className="text-red-600 text-sm font-semibold hover:bg-red-50 px-3 py-1 rounded-lg transition flex items-center gap-1 border border-red-100"
           >
             🚪 تسجيل خروج
           </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all ${
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
          {myItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <span className="text-4xl mb-2">👍</span>
              <span>لا توجد عهد مسجلة باسمك حالياً</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 whitespace-nowrap">اسم العدة</th>
                    <th className="p-4 whitespace-nowrap">الفئة</th>
                    <th className="p-4 whitespace-nowrap">تاريخ الاستلام</th>
                    <th className="p-4 whitespace-nowrap">الحالة</th>
                    <th className="p-4 whitespace-nowrap">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myItems.map(item => (
                    <tr key={item.id}>
                      <td className="p-4 font-bold">{item.name}</td>
                      <td className="p-4 text-gray-600">{item.category}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(item.lastUpdated).toLocaleDateString('ar-SA')}</td>
                      <td className="p-4">
                        {item.status === ItemStatus.PENDING_RETURN ? (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">بانتظار الموافقة</span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">لديك الآن</span>
                        )}
                      </td>
                      <td className="p-4">
                        {item.status === ItemStatus.CHECKED_OUT && (
                          <button
                            onClick={() => {
                              if (!currentUser) return;
                              const message = "تنبيه هام:\n\nهل قمت بتسليم العدة فعلياً للمشرف (م. ياسر الشربي أو م. سرور العصيمي)؟\n\nاضغط 'موافق' فقط إذا تم التسليم الفعلي ليرفع النظام طلب الموافقة للمشرف.";
                              if(confirm(message)) {
                                onRequestReturn(item.id, currentUser.name);
                              }
                            }}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition shadow-sm whitespace-nowrap"
                          >
                            رفع طلب إرجاع
                          </button>
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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 border-t-4 border-t-blue-500">
          <div className="mb-6 border-b pb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📥</span>
              استلام / صرف عدة
            </h3>
            <p className="text-gray-500 text-sm mt-1">
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
                onChange={(e) => setIsManualEntry(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="manualMode" className="text-gray-700 font-semibold cursor-pointer select-none">
                العدة غير موجودة في القائمة؟ (تسجيل يدوي واستلام فوري)
              </label>
            </div>
          </div>

          {!isManualEntry ? (
            <form onSubmit={handleCheckoutSubmit} className="space-y-6 max-w-lg animate-fade-in">
              <div>
                <label className="block text-gray-700 font-bold mb-2">اختر العدة المطلوبة</label>
                <select
                  required
                  value={selectedCheckoutItemId}
                  onChange={(e) => setSelectedCheckoutItemId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">-- اختر من القائمة --</option>
                  {availableItems.length === 0 ? (
                    <option disabled>لا توجد معدات متاحة حالياً</option>
                  ) : (
                    availableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ({item.category})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  عدد العناصر المتاحة: {availableItems.length}
                </p>
              </div>

              <button
                type="submit"
                disabled={!selectedCheckoutItemId}
                className={`w-full py-3 rounded-lg font-bold text-lg shadow-md transition-all ${
                  !selectedCheckoutItemId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                تأكيد الاستلام
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualCheckoutSubmit} className="space-y-4 max-w-lg animate-fade-in">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4 text-sm text-green-800">
                أنت تقوم الآن بتسجيل عدة جديدة واستلامها فوراً لتصبح تحت عهدتك. لن تظهر هذه العدة كـ "متاحة" بل ستسجل كـ "معارة" لك.
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">اسم العدة / الجهاز</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="مثال: جهاز قياس حرارة، طقم مفكات..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">الفئة</label>
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
                  <label className="block text-gray-700 mb-2 font-semibold">الكمية</label>
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