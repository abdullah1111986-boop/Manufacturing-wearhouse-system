import React from 'react';
import { Item, ItemStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  items: Item[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const total = items.length;
  const available = items.filter(i => i.status === ItemStatus.AVAILABLE).length;
  const checkedOut = items.filter(i => i.status === ItemStatus.CHECKED_OUT).length;
  const pendingReturn = items.filter(i => i.status === ItemStatus.PENDING_RETURN).length;

  const data = [
    { name: 'متاح', value: available, color: '#10B981' }, // Green
    { name: 'معار (خارج)', value: checkedOut, color: '#EF4444' }, // Red
    { name: 'بانتظار الإرجاع', value: pendingReturn, color: '#F59E0B' }, // Yellow
  ];

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">إجمالي العهد</p>
            <h3 className="text-3xl font-bold text-gray-800">{total}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-2xl">📦</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">المتاح حالياً</p>
            <h3 className="text-3xl font-bold text-green-600">{available}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600 text-2xl">✅</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">خارج المستودع</p>
            <h3 className="text-3xl font-bold text-red-600">{checkedOut}</h3>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600 text-2xl">🚀</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">طلبات إرجاع</p>
            <h3 className="text-3xl font-bold text-yellow-600">{pendingReturn}</h3>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 text-2xl">⚠️</div>
        </div>
      </div>

      {/* Charts and Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">حالة المستودع</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Borrowers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">العهد الخارجية وطلبات الإرجاع</h3>
          {checkedOut === 0 && pendingReturn === 0 ? (
            <div className="text-center text-gray-400 py-8">لا توجد عهد خارج المستودع حالياً</div>
          ) : (
            <div className="overflow-y-auto max-h-64 space-y-3">
              {items.filter(i => i.status === ItemStatus.CHECKED_OUT || i.status === ItemStatus.PENDING_RETURN).map(item => (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.status === ItemStatus.PENDING_RETURN ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-100'
                }`}>
                  <div>
                    <div className="font-bold text-gray-800">
                      {item.name}
                      {item.status === ItemStatus.PENDING_RETURN && <span className="mr-2 text-xs bg-yellow-200 text-yellow-800 px-1 rounded">طلب إرجاع</span>}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">مع المدرب: {item.currentHolder}</div>
                  </div>
                  <div className="text-xs bg-white px-2 py-1 rounded shadow-sm">
                    {new Date(item.lastUpdated).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;