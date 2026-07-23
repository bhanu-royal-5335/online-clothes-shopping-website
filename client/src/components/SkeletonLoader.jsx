export const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 space-y-4">
      <div className="shimmer-bg h-48 w-full rounded-xl"></div>
      <div className="space-y-2">
        <div className="shimmer-bg h-4 w-2/3 rounded"></div>
        <div className="shimmer-bg h-3 w-1/2 rounded"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="shimmer-bg h-6 w-1/4 rounded"></div>
        <div className="shimmer-bg h-8 w-1/3 rounded-lg"></div>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
          <div className="flex justify-between">
            <div className="shimmer-bg h-4 w-1/2 rounded"></div>
            <div className="shimmer-bg h-6 w-6 rounded-full"></div>
          </div>
          <div className="shimmer-bg h-8 w-1/3 rounded"></div>
          <div className="shimmer-bg h-3 w-2/3 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="space-y-4 py-2">
      <div className="flex space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer-bg h-6 flex-1 rounded"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex space-x-4 py-2 border-t border-slate-100 dark:border-slate-800">
          <div className="shimmer-bg h-4 flex-1 rounded"></div>
          <div className="shimmer-bg h-4 flex-1 rounded"></div>
          <div className="shimmer-bg h-4 flex-1 rounded"></div>
          <div className="shimmer-bg h-4 flex-1 rounded"></div>
        </div>
      ))}
    </div>
  );
};
