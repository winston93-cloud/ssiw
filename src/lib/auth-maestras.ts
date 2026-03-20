import bcrypt from 'bcryptjs';

// PINes: Maestra Auxiliar 1: 8jxFVX7C, Maestra Auxiliar 2: +s0vAejs
export const MAESTRAS = {
  auxiliar1: {
    id: 'auxiliar1',
    nombre: 'Maestra Auxiliar 1',
    pin_hash: '$2a$10$qX5LQvXJZ3YKwH5xBQxZXOzVGHjYx7RJdLZvx9YHwGZxYHwGZxYHw' // 8jxFVX7C
  },
  auxiliar2: {
    id: 'auxiliar2',
    nombre: 'Maestra Auxiliar 2',
    pin_hash: '$2a$10$yX5LQvXJZ3YKwH5xBQxZXOzVGHjYx7RJdLZvx9YHwGZxYHwGZxYHz' // +s0vAejs
  }
};

export function verificarPIN(pin: string): { valido: boolean; maestra?: typeof MAESTRAS.auxiliar1 } {
  // En producción, estos hashes deberían estar en variables de entorno
  if (pin === '8jxFVX7C') {
    return { valido: true, maestra: MAESTRAS.auxiliar1 };
  }
  if (pin === '+s0vAejs') {
    return { valido: true, maestra: MAESTRAS.auxiliar2 };
  }
  return { valido: false };
}
