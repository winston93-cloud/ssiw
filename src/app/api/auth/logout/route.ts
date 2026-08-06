import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/ssiwSession'

/** Cierra la cookie de sesión SSIW (logout). */
export async function POST() {
  const res = NextResponse.json({ success: true })
  clearSessionCookie(res)
  return res
}

export async function DELETE() {
  return POST()
}
