import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Checkout from './components/Checkout';
import Returns from './components/Returns';
import Warehouse from './components/Warehouse';
import ActivityLog from './components/ActivityLog';
import SmartAssistant from './components/SmartAssistant';
import InstructorPortal from './components/InstructorPortal';
import InstructorManager from './components/InstructorManager';
import SupervisorLogin from './components/SupervisorLogin';
import PortalSelection from './components/PortalSelection';

import { Item, Transaction, ItemStatus, TransactionType, Instructor } from './types';
import { 
  subscribeToInventory, 
  subscribeToTransactions, 
  subscribeToInstructors,
  addInventoryItem,
  updateInventoryItem,
  addTransaction,
  addInstructor,
  updateInstructor,
  deleteInstructor,
  seedInitialInstructors
} from './services/storageService';

const App: React.FC = () => {
  // Navigation State
  const [activePortal, setActivePortal] = useState<'selection' | 'supervisor' | 'instructor'>('selection');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State (Managed via Firebase Subscriptions)
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  
  // Supervisor Authentication State
  const [isSupervisorAuth, setIsSupervisorAuth] = useState(false);

  // --- Firebase Subscriptions ---
  useEffect(() => {
    const unsubscribeInventory = subscribeToInventory((data) => setItems(data));
    const unsubscribeTransactions = subscribeToTransactions((data) => setTransactions(data));
    const unsubscribeInstructors = subscribeToInstructors((data) => {
      setInstructors(data);
      // Seed if empty
      if (data.length === 0) {
        seedInitialInstructors();
      }
    });

    // Check local supervisor auth
    const storedAuth = localStorage.getItem('makhzan_supervisor_auth');
    if (storedAuth === 'true') {
      setIsSupervisorAuth(true);
    }

    return () => {
      unsubscribeInventory();
      unsubscribeTransactions();
      unsubscribeInstructors();
    };
  }, []);

  // --- Handlers ---

  const handlePortalSelect = (portal: 'supervisor' | 'instructor') => {
    setActivePortal(portal);
    if (portal === 'instructor') {
      setActiveTab('instructor-portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleBackToMain = () => {
    setActivePortal('selection');
    setIsSupervisorAuth(false);
    localStorage.removeItem('makhzan_supervisor_auth');
  };

  const handleSupervisorLogin = () => {
    setIsSupervisorAuth(true);
    localStorage.setItem('makhzan_supervisor_auth', 'true');
    setActiveTab('dashboard');
  };

  const handleSupervisorLogout = () => {
    setIsSupervisorAuth(false);
    localStorage.removeItem('makhzan_supervisor_auth');
    setActivePortal('selection');
  };

  // Instructor Management
  const handleAddInstructor = async (name: string) => {
    try {
      await addInstructor({ name, password: '1234' });
      alert('تم إضافة المدرب بنجاح');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء إضافة المدرب');
    }
  };

  const handleUpdateInstructor = async (updatedInstructor: Instructor) => {
    try {
      await updateInstructor(updatedInstructor);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تحديث بيانات المدرب');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    try {
      await deleteInstructor(id);
      alert('تم حذف المدرب بنجاح');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء حذف المدرب');
    }
  };

  const handleResetPassword = async (id: string) => {
    const instructor = instructors.find(i => i.id === id);
    if (instructor) {
      await updateInstructor({ ...instructor, password: '1234' });
      alert('تم إعادة تعيين كلمة المرور إلى 1234');
    }
  };

  // Inventory & Transactions
  const handleAddItem = async (newItemData: Omit<Item, 'id' | 'lastUpdated'>, quantity: number = 1) => {
    try {
      const promises = [];
      const timestamp = new Date().toISOString();

      for (let i = 0; i < quantity; i++) {
        // Add Item
        const itemPromise = addInventoryItem({
          ...newItemData,
          status: ItemStatus.AVAILABLE,
          lastUpdated: timestamp
        }).then((docRef) => {
           // We don't have the ID until after addDoc, but we need it for the transaction log?
           // Actually, it's better to add the transaction separately or just log "New Item Added" generic.
           // For simplicity in this async loop, we'll log the transaction after the item is added.
           return addTransaction({
            itemId: 'N/A', // Or ideally the new ID
            itemName: newItemData.name,
            instructorName: newItemData.addedBy || 'المشرف',
            type: TransactionType.ADD_ITEM,
            timestamp: timestamp
           });
        });
        promises.push(itemPromise);
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Error adding items:", error);
      alert("حدث خطأ أثناء إضافة الأصناف");
    }
  };

  const handleCheckout = async (itemId: string, instructorName: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      await updateInventoryItem(itemId, {
        status: ItemStatus.CHECKED_OUT,
        currentHolder: instructorName
      });

      await addTransaction({
        itemId,
        itemName: item.name,
        instructorName,
        type: TransactionType.CHECKOUT,
        timestamp: new Date().toISOString()
      });
      alert('تم تسجيل عملية الاستلام بنجاح');
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء عملية الاستلام");
    }
  };

  const handleManualCheckout = async (itemData: {name: string, category: string}, instructorName: string) => {
    try {
      // 1. Add Item as Checked Out immediately
      await addInventoryItem({
        name: itemData.name,
        category: itemData.category,
        status: ItemStatus.CHECKED_OUT,
        currentHolder: instructorName,
        addedBy: 'المشرف (صرف فوري)',
        lastUpdated: new Date().toISOString()
      });

      // 2. Add Transaction
      await addTransaction({
        itemId: 'MANUAL_ENTRY', // Or fetch ID if needed, but keeping it simple for logs
        itemName: itemData.name,
        instructorName,
        type: TransactionType.CHECKOUT,
        timestamp: new Date().toISOString()
      });
      
      alert('تم تسجيل العدة الجديدة وصرفها بنجاح');
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء العملية");
    }
  };

  const handleRequestReturn = async (itemId: string, instructorName: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      await updateInventoryItem(itemId, {
        status: ItemStatus.PENDING_RETURN
      });

      await addTransaction({
        itemId,
        itemName: item.name,
        instructorName,
        type: TransactionType.RETURN_REQUEST,
        timestamp: new Date().toISOString()
      });

      alert('تم رفع طلب الإرجاع بنجاح. سيقوم المشرف بمعاينة العدة والموافقة عليها.');
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء طلب الإرجاع");
    }
  };

  const handleApproveReturn = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const instructorName = item.currentHolder || 'غير معروف';

    try {
      await updateInventoryItem(itemId, {
        status: ItemStatus.AVAILABLE,
        currentHolder: undefined // Delete field
      });

      await addTransaction({
        itemId,
        itemName: item.name,
        instructorName,
        type: TransactionType.RETURN,
        timestamp: new Date().toISOString()
      });

      alert(`تم إرجاع "${item.name}" إلى المستودع بنجاح.`);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء عملية الإرجاع");
    }
  };

  // Rendering Logic
  if (activePortal === 'selection') {
    return <PortalSelection onSelect={handlePortalSelect} />;
  }

  const renderContent = () => {
    if (activePortal === 'instructor') {
      return (
        <InstructorPortal 
          items={items} 
          instructors={instructors}
          onAddItem={handleAddItem} 
          onRequestReturn={handleRequestReturn} 
          onUpdateInstructor={handleUpdateInstructor}
          onCheckout={handleCheckout}
          onBack={handleBackToMain}
        />
      );
    }

    if (!isSupervisorAuth) {
      return (
        <div>
          <button 
            onClick={handleBackToMain}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center gap-2"
          >
            ➡️ العودة
          </button>
          <SupervisorLogin onLogin={handleSupervisorLogin} />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard items={items} />;
      case 'warehouse':
        return <Warehouse items={items} onAddItem={handleAddItem} />;
      case 'instructors': 
        return <InstructorManager 
          instructors={instructors}
          onAddInstructor={handleAddInstructor}
          onDeleteInstructor={handleDeleteInstructor}
          onResetPassword={handleResetPassword}
        />;
      case 'checkout':
        return <Checkout 
          items={items} 
          instructors={instructors}
          onCheckout={handleCheckout} 
          onManualCheckout={handleManualCheckout}
        />;
      case 'return':
        return <Returns items={items} onApproveReturn={handleApproveReturn} />;
      case 'history':
        return <ActivityLog transactions={transactions} />;
      case 'ai':
        return <SmartAssistant items={items} transactions={transactions} />;
      default:
        return <Dashboard items={items} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isSupervisorLoggedIn={isSupervisorAuth}
      onSupervisorLogout={handleSupervisorLogout}
      isSidebarVisible={activePortal === 'supervisor' && isSupervisorAuth}
      portalType={activePortal}
      onBackToHome={handleBackToMain}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;