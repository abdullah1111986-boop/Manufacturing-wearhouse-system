import React, { useState } from 'react';
import { Item, Transaction } from '../types';
import { generateWarehouseReport } from '../services/geminiService';

interface SmartAssistantProps {
  items: Item[];
  transactions: Transaction[];
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ items, transactions }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    try {
      const result = await generateWarehouseReport(items, transactions, query);
      setResponse(result);
    } catch (error) {
      setResponse("حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "لخص لي حركة المستودع اليوم",
    "من هو أكثر مدرب لديه عهد حالياً؟",
    "ما هي المعدات التي تحتاج صيانة؟",
    "أعطني تقريراً بالمواد المتوفرة في قسم العدد اليدوية"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span>🤖</span> المساعد الذكي للمستودع
        </h2>
        <p className="text-indigo-100 opacity-90">
          استخدم الذكاء الاصطناعي لتحليل البيانات، إنشاء التقارير، أو الاستعلام عن حالة العهد.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleAsk} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اسأل شيئاً عن المستودع..."
            className="w-full pl-4 pr-12 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-0 text-lg transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query}
            className="absolute left-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'جاري التحليل...' : 'إرسال'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setQuery(s)}
              className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {response && (
        <div className="bg-white rounded-xl p-8 shadow-md border-t-4 border-indigo-500 animate-fade-in">
          <h3 className="text-gray-500 text-sm font-bold uppercase mb-4">الإجابة:</h3>
          <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed whitespace-pre-line">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAssistant;