import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import type { JwtPayload, User } from '../models/types.js';
import { getRepository } from '../repositories/index.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';

export class AuthService {
  private repo = getRepository();

  async register(
    email: string,
    password: string,
    acceptTerms: boolean,
  ): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    if (!acceptTerms) {
      throw new Error('Akceptacja regulaminu jest wymagana');
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Podaj poprawny adres e-mail');
    }

    const existing = await this.repo.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error('Użytkownik o tym adresie e-mail już istnieje');
    }

    const now = new Date().toISOString();
    const user: User = {
      id: nanoid(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      termsAcceptedAt: now,
      createdAt: now,
    };

    await this.repo.createUser(user);
    await this.repo.linkSharesByEmail(user.id, normalizedEmail);

    const token = this.signToken({ userId: user.id, email: user.email });
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.repo.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error('Nieprawidłowy e-mail lub hasło');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Nieprawidłowy e-mail lub hasło');
    }

    await this.repo.linkSharesByEmail(user.id, normalizedEmail);

    const token = this.signToken({ userId: user.id, email: user.email });
    return { user: this.sanitizeUser(user), token };
  }

  async getMe(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new Error('Użytkownik nie znaleziony');
    return this.sanitizeUser(user);
  }

  signToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
