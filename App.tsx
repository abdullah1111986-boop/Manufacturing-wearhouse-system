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
  deleteInventoryItem,
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
      setActiveTab(isSupervisorAuth ? 'dashboard' : 'login');
    }
  };

  const handleSupervisorLogin = () => {
    setIsSupervisorAuth(true);
    localStorage.setItem('makhzan_supervisor_auth', 'true');
    setActiveTab('dashboard');
  };

  const handleSupervisorLogout = () => {
    setIsSupervisorAuth(false);
    localStorage.removeItem('makhzan_supervisor_auth');
    setActiveTab('login');
    setActivePortal('selection');
  };

  const handleSwitchToInstructor = () => {
    setActivePortal('instructor');
    setActiveTab('instructor-portal');
  };

  const handleSwitchToSupervisor = () => {
    setActivePortal('supervisor');
    setActiveTab(isSupervisorAuth ? 'dashboard' : 'login');
  };

  const handleCheckout = async (itemId: string, instructorName: string) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.status === ItemStatus.AVAILABLE) {
      await updateInventoryItem(itemId, { 
        status: ItemStatus.CHECKED_OUT, 
        currentHolder: instructorName 
      });

      await addTransaction({
        itemId: item.id,
        itemName: item.name,
        instructorName,
        type: TransactionType.CHECKOUT,
        timestamp: '' // Service handles timestamp
      });
    }
  };

  const handleManualCheckout = async (itemData: {name: string, category: string}, instructorName: string) => {
    // 1. Add Item as Checked Out
    const newItemRef = await addInventoryItem({
      name: itemData.name,
      category: itemData.category,
      status: ItemStatus.CHECKED_OUT,
      currentHolder: instructorName,
      addedBy: instructorName
    });

    await addTransaction({
      itemId: 'new-manual-item', // Placeholder or need refactor to get ID
      itemName: itemData.name,
      instructorName: instructorName,
      type: TransactionType.CHECKOUT,
      timestamp: ''
    });
  };

  // Handler for Instructors adding items (Bulk) directly to their custody
  const handleInstructorManualCheckout = async (itemData: {name: string, category: string}, quantity: number, instructorName: string) => {
     for (let i = 0; i < quantity; i++) {
        await handleManualCheckout(itemData, instructorName);
     }
  };

  const handleRequestReturn = async (itemId: string, instructorName: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
       await updateInventoryItem(itemId, { status: ItemStatus.PENDING_RETURN });
       // No transaction log for request, only for completion, or maybe a separate type?
       // Existing types include RETURN_REQUEST
       await addTransaction({
         itemId: item.id,
         itemName: item.name,
         instructorName,
         type: TransactionType.RETURN_REQUEST,
         timestamp: ''
       });
    }
  };

  const handleApproveReturn = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const holder = item.currentHolder || 'غير معروف';
      await updateInventoryItem(itemId, { 
        status: ItemStatus.AVAILABLE, 
        currentHolder: undefined 
      });

      await addTransaction({
        itemId: item.id,
        itemName: item.name,
        instructorName: holder,
        type: TransactionType.RETURN,
        timestamp: ''
      });
      
      alert(`تم إرجاع "${item.name}" للمستودع بنجاح`);
    }
  };

  // Supervisor Warehouse Management Handlers
  const handleAddItem = async (itemData: Omit<Item, 'id' | 'lastUpdated'>, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      await addInventoryItem(itemData);
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    await deleteInventoryItem(itemId);
  };

  const handleUpdateInventoryItem = async (itemId: string, data: Partial<Item>) => {
    await updateInventoryItem(itemId, data);
  };

  // Instructor Management
  const handleAddInstructor = async (name: string) => {
    await addInstructor({ name, password: '1234' });
    alert('تم إضافة المدرب بنجاح');
  };

  const handleDeleteInstructor = async (id: string) => {
    await deleteInstructor(id);
    alert('تم حذف المدرب بنجاح');
  };

  const handleResetPassword = async (id: string) => {
    const instructor = instructors.find(i => i.id === id);
    if (instructor) {
      await updateInstructor({ ...instructor, password: '1234' });
      alert('تم إعادة تعيين كلمة المرور إلى 1234');
    }
  };

  const handleUpdateInstructor = async (updatedInstructor: Instructor) => {
    await updateInstructor(updatedInstructor);
  };


  // --- Render ---

  if (activePortal === 'selection') {
    return <PortalSelection onSelect={handlePortalSelect} />;
  }

  // Instructor Portal (No Supervisor Layout)
  if (activePortal === 'instructor') {
    return (
      <InstructorPortal 
        items={items} 
        instructors={instructors}
        onManualCheckout={handleInstructorManualCheckout} 
        onRequestReturn={handleRequestReturn}
        onUpdateInstructor={handleUpdateInstructor}
        onCheckout={handleCheckout}
        onSwitchToSupervisor={handleSwitchToSupervisor}
      />
    );
  }

  // Supervisor Portal
  return (
    <Layout 
      activeTab={activeTab === 'login' ? 'dashboard' : activeTab} 
      setActiveTab={setActiveTab}
      isSupervisorLoggedIn={isSupervisorAuth}
      onSupervisorLogout={handleSupervisorLogout}
      onSwitchToInstructor={handleSwitchToInstructor}
    >
      {!isSupervisorAuth ? (
        <SupervisorLogin onLogin={handleSupervisorLogin} />
      ) : (
        <>
          {activeTab === 'dashboard' && <Dashboard items={items} />}
          {activeTab === 'checkout' && (
            <Checkout 
              items={items} 
              instructors={instructors} 
              onCheckout={handleCheckout}
              onManualCheckout={handleManualCheckout}
            />
          )}
          {activeTab === 'return' && (
            <Returns 
              items={items} 
              onApproveReturn={handleApproveReturn} 
            />
          )}
          {activeTab === 'warehouse' && (
            <Warehouse 
              items={items} 
              onAddItem={handleAddItem}
              onDelete={handleDeleteInventoryItem}
              onUpdate={handleUpdateInventoryItem}
            />
          )}
          {activeTab === 'history' && <ActivityLog transactions={transactions} />}
          {activeTab === 'ai' && <SmartAssistant items={items} transactions={transactions} />}
          {activeTab === 'instructors' && (
            <InstructorManager 
              instructors={instructors} 
              onAddInstructor={handleAddInstructor}
              onDeleteInstructor={handleDeleteInstructor}
              onResetPassword={handleResetPassword}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;