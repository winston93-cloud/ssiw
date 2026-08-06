/** Dashboard principal de servicios_admin (override con NEXT_PUBLIC_SERVICIOS_ADMIN_URL). */
export function urlServiciosAdminDashboard(): string {
  const base = (process.env.NEXT_PUBLIC_SERVICIOS_ADMIN_URL || 'https://servicios-admin.vercel.app').replace(
    /\/$/,
    ''
  )
  return `${base}/dashboard`
}
