export default function AuthLayout({ children }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1f3d] via-[#1a3460] to-[#0d3b72] flex items-center justify-center px-4">
        {children}
      </div>
    )
  }