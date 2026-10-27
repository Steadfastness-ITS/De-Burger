// Profile shape + validation (frontend only; saved on the device).

export type Profile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  photo?: string; // optional, stored as a small JPEG data URI
};

export const EMPTY_PROFILE: Profile = { name: '', email: '', phone: '', address: '' };

export type ProfileErrors = Partial<Record<'name' | 'email' | 'phone' | 'address', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateProfile(p: Profile): ProfileErrors {
  const e: ProfileErrors = {};
  if (p.name.trim().length < 2) e.name = 'Enter your full name';
  if (!EMAIL_RE.test(p.email.trim())) e.email = 'Enter a valid email address';
  const digits = p.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) e.phone = 'Enter a valid phone number';
  if (p.address.trim().length < 8) {
    e.address = 'Enter your full delivery address (street, area, city)';
  }
  return e;
}

// A profile must be complete before the user can place an order.
export const isProfileComplete = (p: Profile | null): p is Profile =>
  p !== null && Object.keys(validateProfile(p)).length === 0;
