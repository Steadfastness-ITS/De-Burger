export const DELIVERY_FEE = 1.5;
export const TAX_RATE = 0.02; // 2%

export const money = (n: number): string => `$${n.toFixed(2)}`;

const round2 = (n: number) => Math.round(n * 100) / 100;

export type Charges = {
  subtotal: number;
  taxes: number;
  delivery: number;
  total: number;
};

// Works out taxes, delivery fee and the grand total from the food subtotal.
export function getCharges(subtotal: number): Charges {
  const taxes = round2(subtotal * TAX_RATE);
  const delivery = DELIVERY_FEE;
  const total = round2(subtotal + taxes + delivery);
  return { subtotal: round2(subtotal), taxes, delivery, total };
}
