import { z } from 'zod';

// Ugandan Phone Regex: 077..., 078..., 070..., 075..., 076..., +25677...
export const ugandanPhoneRegex = /^(\+256|0)(77|78|70|75|76)[0-9]{7}$/;

// Name Regex: Letters, spaces, hyphens, apostrophes (no numbers or symbols like John123)
export const validNameRegex = /^[a-zA-Z\s'-]{2,50}$/;

export const passengerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .refine((val) => validNameRegex.test(val), {
      message: 'Name cannot contain numbers or special symbols (e.g. John123 is invalid)',
    }),
  phone: z
    .string()
    .refine((val) => ugandanPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Enter a valid Ugandan phone number (e.g., 0771234567 or +256771234567)',
    }),
  email: z
    .string()
    .email('Please enter a valid email address (e.g. passenger@travel.ug)'),
});

export const searchSchema = z
  .object({
    origin: z.string().min(1, 'Please select an origin city'),
    destination: z.string().min(1, 'Please select a destination city'),
    date: z.string().min(1, 'Departure date is required'),
    returnDate: z.string().optional(),
    passengers: z.number().min(1, 'At least 1 passenger is required').max(10, 'Max 10 passengers'),
  })
  .refine((data) => data.origin.toLowerCase() !== data.destination.toLowerCase(), {
    message: 'Origin and Destination cannot be the same city',
    path: ['destination'],
  })
  .refine(
    (data) => {
      if (!data.date) return true;
      const selected = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    },
    {
      message: 'Travel date cannot be in the past',
      path: ['date'],
    }
  )
  .refine(
    (data) => {
      if (!data.returnDate || !data.date) return true;
      return new Date(data.returnDate) >= new Date(data.date);
    },
    {
      message: 'Return date cannot be before departure date',
      path: ['returnDate'],
    }
  );

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name is required').refine((v) => validNameRegex.test(v), {
      message: 'Name cannot contain numbers or special symbols',
    }),
    email: z.string().email('Valid email address required'),
    phone: z.string().refine((v) => ugandanPhoneRegex.test(v.replace(/\s+/g, '')), {
      message: 'Must be a valid Ugandan phone number',
    }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
