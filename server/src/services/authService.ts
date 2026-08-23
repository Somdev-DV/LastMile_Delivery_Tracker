import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { Role } from '../types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  address?: string;
  city?: string;
  pincode?: string;
  vehicleType?: string;
  zoneId?: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const email = input.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error(`An account with email ${email} already exists.`);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const role = input.role || Role.CUSTOMER;

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        password: hashedPassword,
        phone: input.phone?.trim(),
        role,
        customerProfile:
          role === Role.CUSTOMER
            ? {
                create: {
                  address: input.address,
                  city: input.city,
                  pincode: input.pincode,
                },
              }
            : undefined,
        agentProfile:
          role === Role.DELIVERY_AGENT
            ? {
                create: {
                  vehicleType: input.vehicleType,
                  zoneId: input.zoneId,
                },
              }
            : undefined,
      },
      include: {
        customerProfile: true,
        agentProfile: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerProfile: user.customerProfile,
        agentProfile: user.agentProfile,
      },
    };
  }

  async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        customerProfile: true,
        agentProfile: {
          include: { zone: true },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerProfile: user.customerProfile,
        agentProfile: user.agentProfile,
      },
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        agentProfile: {
          include: { zone: true },
        },
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      customerProfile: user.customerProfile,
      agentProfile: user.agentProfile,
    };
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; address?: string; city?: string; pincode?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        customerProfile:
          user.role === Role.CUSTOMER
            ? {
                upsert: {
                  create: { address: data.address, city: data.city, pincode: data.pincode },
                  update: { address: data.address, city: data.city, pincode: data.pincode },
                },
              }
            : undefined,
      },
      include: {
        customerProfile: true,
        agentProfile: true,
      },
    });

    return updatedUser;
  }
}

export const authService = new AuthService();
