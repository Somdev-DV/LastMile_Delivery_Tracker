import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { NotificationChannel, NotificationStatus, OrderStatus, Role } from '../types';

export interface SendNotificationInput {
  orderId: string;
  userId: string;
  channel: NotificationChannel;
  event: string;
  message: string;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  async send(input: SendNotificationInput) {
    const { orderId, userId, channel, event, message } = input;

    // 1. Create DB record first in PENDING state
    const notification = await prisma.notification.create({
      data: {
        orderId,
        userId,
        channel,
        event,
        message,
        status: NotificationStatus.PENDING,
      },
    });

    try {
      if (channel === NotificationChannel.EMAIL) {
        await this.dispatchEmail(userId, event, message);
      } else if (channel === NotificationChannel.SMS) {
        await this.dispatchSms(userId, message);
      }

      // Mark SENT
      return prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`[NotificationService] Delivery failed for notification ${notification.id}:`, error);
      return prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.FAILED },
      });
    }
  }

  private async dispatchEmail(userId: string, subject: string, message: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) return;

    if (this.emailTransporter) {
      await this.emailTransporter.sendMail({
        from: env.SMTP_FROM,
        to: user.email,
        subject: `[Last-Mile Delivery] ${subject}`,
        text: message,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #2563eb;">Last-Mile Delivery Tracker</h2>
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
          <p style="font-size: 12px; color: #64748b;">This is an automated notification for your delivery order.</p>
        </div>`,
      });
    } else {
      // Mock provider for development / evaluation
      console.log(`[MOCK EMAIL] To: ${user.email} | Subject: ${subject} | Message: ${message}`);
    }
  }

  private async dispatchSms(userId: string, message: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const phone = user?.phone || 'No phone recorded';

    if (env.SMS_PROVIDER === 'twilio' && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
      console.log(`[TWILIO SMS] To: ${phone} | Body: ${message}`);
      // In production twilio client integration would send here
    } else {
      // Clean mock SMS provider
      console.log(`[MOCK SMS] To: ${phone} | Body: ${message}`);
    }
  }

  /**
   * Helper: Dispatch notifications on order status change to customer
   */
  async notifyStatusChange(
    order: { id: string; orderNumber: string; customerId: string; status: OrderStatus },
    actorRole: Role,
    remarks?: string | null
  ) {
    const eventName = `Order Status: ${order.status}`;
    let text = `Your delivery order #${order.orderNumber} is now ${order.status.replace(/_/g, ' ')}.`;
    if (remarks) {
      text += ` Note: ${remarks}`;
    }

    // Dispatch Email
    await this.send({
      orderId: order.id,
      userId: order.customerId,
      channel: NotificationChannel.EMAIL,
      event: eventName,
      message: text,
    });

    // Dispatch SMS
    await this.send({
      orderId: order.id,
      userId: order.customerId,
      channel: NotificationChannel.SMS,
      event: eventName,
      message: text,
    });
  }

  /**
   * Helper: Dispatch failed delivery alert with reschedule CTA
   */
  async notifyDeliveryFailure(
    order: { id: string; orderNumber: string; customerId: string },
    failureReason: string
  ) {
    const message = `Delivery attempt failed for order #${order.orderNumber}. Reason: ${failureReason}. Please log in to your dashboard to reschedule a convenient delivery time.`;

    await this.send({
      orderId: order.id,
      userId: order.customerId,
      channel: NotificationChannel.EMAIL,
      event: 'Delivery Attempt Failed - Action Required',
      message,
    });

    await this.send({
      orderId: order.id,
      userId: order.customerId,
      channel: NotificationChannel.SMS,
      event: 'Delivery Attempt Failed',
      message,
    });
  }

  /**
   * Helper: Dispatch reschedule confirmation
   */
  async notifyRescheduled(
    order: { id: string; orderNumber: string; customerId: string },
    newDate: Date
  ) {
    const formattedDate = newDate.toLocaleDateString();
    const message = `Your order #${order.orderNumber} has been successfully rescheduled for delivery on ${formattedDate}. A delivery agent will be assigned shortly.`;

    await this.send({
      orderId: order.id,
      userId: order.customerId,
      channel: NotificationChannel.EMAIL,
      event: 'Delivery Rescheduled Confirmed',
      message,
    });
  }

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

export const notificationService = new NotificationService();
