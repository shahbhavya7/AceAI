'use client'

import { signOut } from '@/lib/actions/auth.action'
import { Button } from '@/components/ui/button'

const SignOutButton = () => {
  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/sign-in' // Since `redirect()` doesn't work on client side
  }

  return (
    <button onClick={handleSignOut} className="btn-primary max-sm:w-full">
      Sign Out
    </button>
  )
}

export default SignOutButton
