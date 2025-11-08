module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,vue}'
  ],
  theme: {
    extend: {
      colors: {
        'med-primary': '#1E40AF', // blue-800
        'med-primary-500': '#3B82F6', // blue-500
        'med-slate-700': '#334155',
        'med-slate-500': '#64748B',
        'med-bg': '#F8FAFC', // slate-50
        'med-bg-100': '#F1F5F9', // slate-100
        'med-success': '#10B981', // emerald-500
        'med-danger': '#EF4444', // red-500
        'med-warn': '#F59E0B', // amber-500
        'med-accent': '#E0F2FE' // sky-100
      }
    }
  },
  plugins: []
}
