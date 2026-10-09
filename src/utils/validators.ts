export namespace Validation {
  export interface BookInput {
    title: string;
    author: string;
    year: string;
  }

  export interface UserInput {
    name: string;
    email: string;
  }

  export type Errors<K extends string> = Partial<Record<K, string>>;

  export interface Result<K extends string> {
    valid: boolean;
    errors: Errors<K>;
  }

  export const MESSAGES = {
    required: "Це поле є обов'язковим",
    digitsOnly: 'Допускаються лише цифри',
    invalidYear: 'Вкажіть коректний рік видання, наприклад 2004',
    invalidEmail: 'Вкажіть коректну електронну адресу',
    emailTaken: 'Користувач з таким email вже існує',
    tooShort: (min: number): string => `Мінімум символів: ${min}`,
  } as const;

  export const MIN_TEXT_LENGTH = 2;

  // Рік у форматі YYYY: 1500–2099
  const YEAR_PATTERN = /^(1[5-9]\d{2}|20\d{2})$/;
  const DIGITS_PATTERN = /^\d+$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  export function isRequired(value: string): boolean {
    return value.trim().length > 0;
  }

  export function isMinLength(value: string, min: number = MIN_TEXT_LENGTH): boolean {
    return value.trim().length >= min;
  }

  export function isDigitsOnly(value: string): boolean {
    return DIGITS_PATTERN.test(value.trim());
  }

  export function isValidYear(
    value: string,
    currentYear: number = new Date().getFullYear(),
  ): boolean {
    const trimmed = value.trim();
    return YEAR_PATTERN.test(trimmed) && Number(trimmed) <= currentYear;
  }

  export function isValidEmail(value: string): boolean {
    return EMAIL_PATTERN.test(value.trim());
  }

  export function validateUserId(value: string): string | null {
    if (!isRequired(value)) {
      return MESSAGES.required;
    }
    if (!isDigitsOnly(value)) {
      return MESSAGES.digitsOnly;
    }
    return null;
  }

  export function validateBook(input: BookInput): Result<keyof BookInput> {
    const errors: Errors<keyof BookInput> = {};

    if (!isRequired(input.title)) {
      errors.title = MESSAGES.required;
    } else if (!isMinLength(input.title)) {
      errors.title = MESSAGES.tooShort(MIN_TEXT_LENGTH);
    }
    if (!isRequired(input.author)) {
      errors.author = MESSAGES.required;
    } else if (!isMinLength(input.author)) {
      errors.author = MESSAGES.tooShort(MIN_TEXT_LENGTH);
    }
    if (!isRequired(input.year)) {
      errors.year = MESSAGES.required;
    } else if (!isDigitsOnly(input.year)) {
      errors.year = MESSAGES.digitsOnly;
    } else if (!isValidYear(input.year)) {
      errors.year = MESSAGES.invalidYear;
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  export function validateUser(input: UserInput): Result<keyof UserInput> {
    const errors: Errors<keyof UserInput> = {};

    if (!isRequired(input.name)) {
      errors.name = MESSAGES.required;
    } else if (!isMinLength(input.name)) {
      errors.name = MESSAGES.tooShort(MIN_TEXT_LENGTH);
    }
    if (!isRequired(input.email)) {
      errors.email = MESSAGES.required;
    } else if (!isValidEmail(input.email)) {
      errors.email = MESSAGES.invalidEmail;
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }
}
