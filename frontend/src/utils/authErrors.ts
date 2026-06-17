const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function mapAuthError(message: string): { emailError?: string; passwordError?: string; general?: string } {
  if (message === 'Nieprawidłowy e-mail lub hasło') {
    return { passwordError: message };
  }
  if (message === 'Użytkownik o tym adresie e-mail już istnieje') {
    return { emailError: message };
  }
  if (message === 'Podaj poprawny adres e-mail') {
    return { emailError: message };
  }
  if (message === 'Akceptacja regulaminu jest wymagana') {
    return { general: message };
  }
  return { general: message };
}
