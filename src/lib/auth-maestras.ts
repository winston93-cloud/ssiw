export const MAESTRAS = {
  auxiliar1: {
    id: 'auxiliar1',
    nombre: 'Maestra Auxiliar 1',
  },
  auxiliar2: {
    id: 'auxiliar2',
    nombre: 'Maestra Auxiliar 2',
  },
} as const

const PIN_AUXILIAR_1 = process.env.SSIW_ENTREGA_PIN_1?.trim() || '8jxFVX7C'
const PIN_AUXILIAR_2 = process.env.SSIW_ENTREGA_PIN_2?.trim() || '+s0vAejs'

export function verificarPIN(pin: string): { valido: boolean; maestra?: (typeof MAESTRAS)[keyof typeof MAESTRAS] } {
  const clave = pin.trim()
  if (clave === PIN_AUXILIAR_1) {
    return { valido: true, maestra: MAESTRAS.auxiliar1 }
  }
  if (clave === PIN_AUXILIAR_2) {
    return { valido: true, maestra: MAESTRAS.auxiliar2 }
  }
  return { valido: false }
}
