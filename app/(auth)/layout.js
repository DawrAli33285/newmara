export default function AuthLayout({ children }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #081B31 0%, #0B1830 50%, #12294a 100%)",
      }}
    >
      {children}
    </div>
  )
}