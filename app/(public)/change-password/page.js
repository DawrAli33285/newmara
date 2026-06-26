import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from './ChangePasswordForm'

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0f1923] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/account" className="text-white font-bold text-xl tracking-tight">Mara Media</a>
          <p className="text-gray-400 text-sm mt-2">Change your password</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <ChangePasswordForm />
        </div>
        <div className="text-center mt-6">
          <a href="/account" className="text-sm text-gray-500 hover:text-gray-300 transition">← Back to account</a>
        </div>
      </div>
    </div>
  )
}