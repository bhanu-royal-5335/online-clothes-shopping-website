import { Globe } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector = () => {
  const { currency, changeCurrency, CURRENCIES } = useCurrency();

  return (
    <div className="relative inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700">
      <Globe className="h-3.5 w-3.5 text-primary-500" />
      <select
        value={currency}
        onChange={(e) => changeCurrency(e.target.value)}
        className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
