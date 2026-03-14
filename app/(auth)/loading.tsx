export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background abstract decoration elements */}
      <div className="absolute top-0 w-full h-[400px] bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-700 fade-in relative overflow-hidden">
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-800/10 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />

        {/* Logo and Header area */}
        <div className="flex flex-col items-center justify-center pt-2">
          {/* Logo Placeholder */}
          <div className="h-14 w-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse shadow-sm mb-6 flex items-center justify-center">
             <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded-md" />
          </div>
          
          {/* Title and Subtitle */}
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-3" />
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
        </div>

        <div className="mt-10 space-y-6">
          {/* Form Fields */}
          <div className="space-y-5">
            {/* Input Group 1 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-11 w-full bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse border border-gray-100 dark:border-gray-700" />
            </div>
            
            {/* Input Group 2 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                {/* Forgot password link placeholder */}
                <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-11 w-full bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse border border-gray-100 dark:border-gray-700" />
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-2">
            {/* Primary Button */}
            <div className="h-11 w-full bg-blue-100 dark:bg-blue-900/40 rounded-lg animate-pulse flex items-center justify-center">
              <div className="h-4 w-24 bg-blue-200/50 dark:bg-blue-800/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <div className="px-4 bg-white dark:bg-gray-900 h-4 w-24 rounded bg-gray-100/50 dark:bg-gray-800/50 animate-pulse" />
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 animate-pulse" />
            <div className="h-10 w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 animate-pulse" />
          </div>

          {/* Footer Link */}
          <div className="flex justify-center pt-4">
             <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
