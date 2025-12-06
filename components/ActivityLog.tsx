import React from 'react';
import { Transaction, TransactionType } from '../types';

interface ActivityLogProps {
  transactions: Transaction[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ transactions }) => {
  // Filter transactions to only show CHECKOUT and RETURN types as requested
  const filteredTransactions = transactions.filter(t => 
    t.type === TransactionType.CHECKOUT || t.type === TransactionType.RETURN
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">سجل حركة العهد (استلام وتسليم)</h2>
        <span className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600">
           العدد: {filteredTransactions.length}
        </span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">لا توجد عمليات استلام أو تسليم مسجلة حتى الآن</div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(t => (
              <div key={t.id} className="flex items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <div className={`p-3 rounded-full ml-4 ${
                  t.type === TransactionType.CHECKOUT ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {t.type === TransactionType.CHECKOUT ? '📤' : '📥'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800">
                      {t.instructorName} 
                      <span className="font-normal text-gray-500 mx-2">قام بـ</span>
                      <span className={`${t.type === TransactionType.CHECKOUT ? 'text-red-600' : 'text-green-600'}`}>
                        {t.type === TransactionType.CHECKOUT ? 'استلام (خروج)' : 'تسليم (إرجاع)'}
                      </span>
                    </h4>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(t.timestamp).toLocaleString('en-US', { hour12: false })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    العنصر: <span className="font-semibold">{t.itemName}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;