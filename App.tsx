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

import { Item, Transaction, ItemStatus, TransactionType, Instructor } from './types';
import { 
  getInventory, 
  saveInventory, 
  getTransactions, 
  addTransaction,
  getInstructors,
  saveInstructors 
} from './services/storageService';

// Utility to generate unique IDs compatible with all browsers
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('instructor-portal'); // Default to public tab
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  
  // Supervisor Authentication State
  const [isSupervisorAuth, setIsSupervisorAuth] = useState(false);

  // Load data on mount
  useEffect(() => {
    setItems(getInventory());
    setTransactions(getTransactions());
    setInstructors(getInstructors());
    
    // Check if supervisor was previously logged in
    const storedAuth = localStorage.getItem('makhzan_supervisor_auth');
    if (storedAuth === 'true') {
      setIsSupervisorAuth(true);
    }
  }, []);

  const handleSupervisorLogin = () => {
    setIsSupervisorAuth(true);
    localStorage.setItem('makhzan_supervisor_auth', 'true');
    setActiveTab('dashboard'); // Redirect to dashboard after login
  };

  const handleSupervisorLogout = () => {
    setIsSupervisorAuth(false);
    localStorage.removeItem('makhzan_supervisor_auth');
    setActiveTab('instructor-portal');
  };

  const handleUpdateInstructor = (updatedInstructor: Instructor) => {
    const updatedList = instructors.map(inst => 
      inst.id === updatedInstructor.id ? updatedInstructor : inst
    );
    setInstructors(updatedList);
    saveInstructors(updatedList);
  };

  // --- Instructor Management Handlers ---
  const handleAddInstructor = (name: string) => {
    const newInstructor: Instructor = {
      id: generateId(),
      name: name,
      password: '1234' // Default password
    };
    const updatedList = [...instructors, newInstructor];
    setInstructors(updatedList);
    saveInstructors(updatedList);
    alert('تم إضافة المدرب بنجاح');
  };

  const handleDeleteInstructor = (id: string) => {
    const updatedList = instructors.filter(i => i.id !== id);
    setInstructors(updatedList);
    saveInstructors(updatedList);
    alert('تم حذف المدرب بنجاح');
  };

  const handleResetPassword = (id: string) => {
    const updatedList = instructors.map(inst => 
      inst.id === id ? { ...inst, password: '1234' } : inst
    );
    setInstructors(updatedList);
    saveInstructors(updatedList);
    alert('تم إعادة تعيين كلمة المرور إلى 1234');
  };
  // --------------------------------------

  // Handler for manual add by Supervisor OR Instructor with Quantity support
  const handleAddItem = (newItemData: Omit<Item, 'id' | 'lastUpdated'>, quantity: number = 1) => {
    const newItems: Item[] = [];
    const newTransactions: Transaction[] = [];
    const timestamp = new Date().toISOString();

    for (let i = 0; i < quantity; i++) {
      const newItem: Item = {
        ...newItemData,
        id: generateId(),
        lastUpdated: timestamp,
        status: ItemStatus.AVAILABLE,
      };
      newItems.push(newItem);

      newTransactions.push({
        id: generateId(),
        itemId: newItem.id,
        itemName: newItem.name,
        instructorName: newItem.addedBy || 'المشرف',
        type: TransactionType.ADD_ITEM,
        timestamp: timestamp
      });
    }

    const updatedItems = [...items, ...newItems];
    setItems(updatedItems);
    saveInventory(updatedItems);
    
    const updatedTransactions = [...newTransactions.reverse(), ...transactions];
    setTransactions(updatedTransactions);
    
    newTransactions.forEach(t => addTransaction(t));
  };

  const handleCheckout = (itemId: string, instructorName: string) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: ItemStatus.CHECKED_OUT,
          currentHolder: instructorName,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    });

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newTransaction: Transaction = {
      id: generateId(),
      itemId: itemId,
      itemName: item.name,
      instructorName: instructorName,
      type: TransactionType.CHECKOUT,
      timestamp: new Date().toISOString()
    };

    setItems(updatedItems);
    saveInventory(updatedItems);
    
    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    addTransaction(newTransaction);
  };

  // Handle Manual Checkout (Create Item AND Checkout immediately)
  const handleManualCheckout = (itemData: {name: string, category: string}, instructorName: string) => {
    const newItemId = generateId();
    const timestamp = new Date().toISOString();
    
    const newItem: Item = {
      id: newItemId,
      name: itemData.name,
      category: itemData.category,
      status: ItemStatus.CHECKED_OUT,
      currentHolder: instructorName,
      lastUpdated: timestamp,
      addedBy: 'المشرف (صرف فوري)'
    };

    const newTransaction: Transaction = {
      id: generateId(),
      itemId: newItemId,
      itemName: newItem.name,
      instructorName: instructorName,
      type: TransactionType.CHECKOUT,
      timestamp: timestamp
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    saveInventory(updatedItems);

    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    addTransaction(newTransaction);
  };

  // Instructor requests return
  const handleRequestReturn = (itemId: string, instructorName: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Update Item Status
    const updatedItems = items.map(currentItem => {
      if (currentItem.id === itemId) {
        return {
          ...currentItem,
          status: ItemStatus.PENDING_RETURN,
          lastUpdated: new Date().toISOString()
        };
      }
      return currentItem;
    });

    // Create Transaction Log
    const newTransaction: Transaction = {
      id: generateId(),
      itemId: itemId,
      itemName: item.name,
      instructorName: instructorName,
      type: TransactionType.RETURN_REQUEST,
      timestamp: new Date().toISOString()
    };

    // Save State
    setItems(updatedItems);
    saveInventory(updatedItems);
    
    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    addTransaction(newTransaction);

    alert('تم رفع طلب الإرجاع بنجاح. سيقوم المشرف بمعاينة العدة والموافقة عليها.');
  };

  // Supervisor approves return OR manually returns item
  const handleApproveReturn = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const instructorName = item.currentHolder || 'غير معروف';

    // Update Item Status
    const updatedItems = items.map(currentItem => {
      if (currentItem.id === itemId) {
        return {
          ...currentItem,
          status: ItemStatus.AVAILABLE,
          currentHolder: undefined, // Clear holder
          lastUpdated: new Date().toISOString()
        };
      }
      return currentItem;
    });

    // Create Transaction Log
    const newTransaction: Transaction = {
      id: generateId(),
      itemId: itemId,
      itemName: item.name,
      instructorName: instructorName,
      type: TransactionType.RETURN,
      timestamp: new Date().toISOString()
    };

    // Save State
    setItems(updatedItems);
    saveInventory(updatedItems);

    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    addTransaction(newTransaction);

    alert(`تم إرجاع "${item.name}" إلى المستودع بنجاح.`);
  };

  const renderContent = () => {
    // PUBLIC ACCESS: Instructor Portal
    if (activeTab === 'instructor-portal') {
       return <InstructorPortal 
          items={items} 
          instructors={instructors}
          onAddItem={handleAddItem} 
          onRequestReturn={handleRequestReturn} 
          onUpdateInstructor={handleUpdateInstructor}
          onCheckout={handleCheckout}
        />;
    }

    // RESTRICTED ACCESS: All other tabs
    if (!isSupervisorAuth) {
      return <SupervisorLogin onLogin={handleSupervisorLogin} />;
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
    >
      {renderContent()}
    </Layout>
  );
};

export default App;