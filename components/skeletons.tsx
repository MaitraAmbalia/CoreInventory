import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div className="space-y-3 w-full sm:w-[50%]">
          <div className="h-9 w-48 sm:w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-4 w-64 sm:w-[28rem] bg-gray-100 dark:bg-gray-800/80 rounded-md animate-pulse" />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="h-10 w-full sm:w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse shadow-sm" />
          <div className="h-10 w-full sm:w-40 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0c0a09] h-[160px]">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
                <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700/80 rounded-lg animate-pulse" />
              </div>
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0c0a09] p-6 h-[400px] animate-pulse">
           <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded-md mb-8" />
           <div className="w-full h-[250px] bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
        </div>
        <div className="col-span-1 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0c0a09] p-6 h-[400px] animate-pulse">
           <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-6" />
           <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-12 w-full bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800/80 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="flex gap-4 items-center p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0c0a09] mt-6">
        <div className="h-10 w-[300px] bg-gray-100 dark:bg-gray-800/80 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-gray-100 dark:bg-gray-800/80 rounded-lg animate-pulse" />
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0c0a09] overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
           {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
           ))}
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-6 py-5 items-center">
               <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
               <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
               <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800/80 rounded-full animate-pulse" />
               <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
               <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2 mb-8">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800/80 rounded-md animate-pulse" />
      </div>

      <div className="p-6 md:p-8 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0c0a09] space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
           {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                 <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                 <div className="h-11 w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse" />
              </div>
           ))}
        </div>
        <div className="space-y-2 pt-4">
           <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
           <div className="h-32 w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-pulse" />
        </div>
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
           <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
           <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
