import { PrismaClient, Role, AgentAvailability, OrderType, PaymentType, RouteType, OrderStatus, AssignmentMethod, AttemptStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Last-Mile Delivery Tracker Database Seeding...');

  // Clean existing data in reverse order of foreign key dependencies
  await prisma.notification.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.deliveryAttempt.deleteMany();
  await prisma.deliveryAssignment.deleteMany();
  await prisma.rescheduleRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.rateCard.deleteMany();
  await prisma.codSurcharge.deleteMany();
  await prisma.area.deleteMany();
  await prisma.deliveryAgent.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // Passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const agentPassword = await bcrypt.hash('Agent@123', 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@lastmile.com',
      password: adminPassword,
      phone: '+91 98765 43210',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created: admin@lastmile.com');

  // 2. Create Zones
  const zoneA = await prisma.zone.create({
    data: {
      name: 'Zone A - Bangalore Central',
      description: 'Central Bangalore covering Koramangala, Indiranagar, MG Road, and CBD',
      isActive: true,
    },
  });

  const zoneB = await prisma.zone.create({
    data: {
      name: 'Zone B - Bangalore East & Tech Corridor',
      description: 'East Bangalore covering Whitefield, Bellandur, Marathahalli, and Outer Ring Road',
      isActive: true,
    },
  });

  const zoneC = await prisma.zone.create({
    data: {
      name: 'Zone C - Bangalore North & Airport Corridor',
      description: 'North Bangalore covering Hebbal, Yelahanka, Manyata Tech Park, and Devanahalli',
      isActive: true,
    },
  });
  console.log('✅ Zones created: Zone A, Zone B, Zone C');

  // 3. Create Areas / Pincode Mappings
  const areasData = [
    // Zone A
    { name: 'Koramangala', pincode: '560034', city: 'Bangalore', zoneId: zoneA.id },
    { name: 'Indiranagar', pincode: '560038', city: 'Bangalore', zoneId: zoneA.id },
    { name: 'MG Road / Brigade Road', pincode: '560001', city: 'Bangalore', zoneId: zoneA.id },
    { name: 'Jayanagar', pincode: '560041', city: 'Bangalore', zoneId: zoneA.id },

    // Zone B
    { name: 'Whitefield', pincode: '560066', city: 'Bangalore', zoneId: zoneB.id },
    { name: 'Bellandur / Sarjapur Rd', pincode: '560103', city: 'Bangalore', zoneId: zoneB.id },
    { name: 'Marathahalli', pincode: '560037', city: 'Bangalore', zoneId: zoneB.id },
    { name: 'Electronic City', pincode: '560100', city: 'Bangalore', zoneId: zoneB.id },

    // Zone C
    { name: 'Hebbal', pincode: '560024', city: 'Bangalore', zoneId: zoneC.id },
    { name: 'Yelahanka', pincode: '560064', city: 'Bangalore', zoneId: zoneC.id },
    { name: 'Manyata Tech Park / Nagavara', pincode: '560045', city: 'Bangalore', zoneId: zoneC.id },
  ];

  for (const area of areasData) {
    await prisma.area.create({ data: area });
  }
  console.log('✅ 11 Areas mapped to Zones.');

  // 4. Create Rate Cards
  // B2C Intra-Zone: Base ₹50, Per Kg ₹10 (covers up to 0.5kg)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2C,
      routeType: RouteType.INTRA_ZONE,
      baseRate: 50.0,
      perKgRate: 10.0,
      minWeight: 0.5,
      isActive: true,
    },
  });

  // B2C Inter-Zone: Base ₹100, Per Kg ₹15 (covers up to 0.5kg)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2C,
      routeType: RouteType.INTER_ZONE,
      baseRate: 100.0,
      perKgRate: 15.0,
      minWeight: 0.5,
      isActive: true,
    },
  });

  // B2B Intra-Zone: Base ₹80, Per Kg ₹8 (covers up to 1.0kg)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2B,
      routeType: RouteType.INTRA_ZONE,
      baseRate: 80.0,
      perKgRate: 8.0,
      minWeight: 1.0,
      isActive: true,
    },
  });

  // B2B Inter-Zone: Base ₹150, Per Kg ₹12 (covers up to 1.0kg)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2B,
      routeType: RouteType.INTER_ZONE,
      baseRate: 150.0,
      perKgRate: 12.0,
      minWeight: 1.0,
      isActive: true,
    },
  });
  console.log('✅ Rate Cards created for B2C & B2B.');

  // 5. Create COD Surcharges
  await prisma.codSurcharge.create({
    data: {
      orderType: OrderType.B2C,
      percentage: 2.0, // 2% of COD value
      flatAmount: 25.0, // minimum ₹25
      isActive: true,
    },
  });

  await prisma.codSurcharge.create({
    data: {
      orderType: OrderType.B2B,
      percentage: 1.5, // 1.5% of COD value
      flatAmount: 50.0, // minimum ₹50
      isActive: true,
    },
  });
  console.log('✅ COD Surcharges configured.');

  // 6. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'customer1@test.com',
      password: customerPassword,
      phone: '+91 91234 56789',
      role: Role.CUSTOMER,
      customerProfile: {
        create: {
          address: '4th Block, Koramangala',
          city: 'Bangalore',
          pincode: '560034',
        },
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'customer2@test.com',
      password: customerPassword,
      phone: '+91 92345 67890',
      role: Role.CUSTOMER,
      customerProfile: {
        create: {
          address: 'ITPB Road, Whitefield',
          city: 'Bangalore',
          pincode: '560066',
        },
      },
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: 'Apex Retail Enterprises (B2B)',
      email: 'customer3@test.com',
      password: customerPassword,
      phone: '+91 93456 78901',
      role: Role.CUSTOMER,
      customerProfile: {
        create: {
          address: 'Manyata Embassy Business Park, Nagavara',
          city: 'Bangalore',
          pincode: '560045',
        },
      },
    },
  });
  console.log('✅ 3 Customers created.');

  // 7. Create Delivery Agents
  const agent1User = await prisma.user.create({
    data: {
      name: 'Vikram Sethi (Express Rider)',
      email: 'agent1@lastmile.com',
      password: agentPassword,
      phone: '+91 98111 22233',
      role: Role.DELIVERY_AGENT,
      agentProfile: {
        create: {
          availability: AgentAvailability.AVAILABLE,
          latitude: 12.9716,
          longitude: 77.5946,
          zoneId: zoneA.id,
          vehicleType: 'Two Wheeler (Motorcycle)',
        },
      },
    },
    include: { agentProfile: true },
  });

  const agent2User = await prisma.user.create({
    data: {
      name: 'Sunil Kumar',
      email: 'agent2@lastmile.com',
      password: agentPassword,
      phone: '+91 98222 33344',
      role: Role.DELIVERY_AGENT,
      agentProfile: {
        create: {
          availability: AgentAvailability.AVAILABLE,
          latitude: 12.9698,
          longitude: 77.75,
          zoneId: zoneB.id,
          vehicleType: 'Electric Scooter',
        },
      },
    },
    include: { agentProfile: true },
  });

  const agent3User = await prisma.user.create({
    data: {
      name: 'Arjun Das',
      email: 'agent3@lastmile.com',
      password: agentPassword,
      phone: '+91 98333 44455',
      role: Role.DELIVERY_AGENT,
      agentProfile: {
        create: {
          availability: AgentAvailability.BUSY,
          latitude: 12.9352,
          longitude: 77.6245,
          zoneId: zoneA.id,
          vehicleType: 'Two Wheeler',
        },
      },
    },
    include: { agentProfile: true },
  });

  console.log('✅ Delivery Agents created.');

  // 8. Sample Order 1: DELIVERED
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'LM-2024-001001',
      customerId: customer1.id,
      pickupAddress: 'Flat 302, 100ft Road, Indiranagar',
      pickupPincode: '560038',
      pickupCity: 'Bangalore',
      dropAddress: '15, 5th Cross, Koramangala 4th Block',
      dropPincode: '560034',
      dropCity: 'Bangalore',
      pickupZoneId: zoneA.id,
      dropZoneId: zoneA.id,
      length: 20.0,
      breadth: 15.0,
      height: 10.0,
      actualWeight: 1.5,
      volumetricWeight: 0.6,
      billableWeight: 1.5,
      orderType: OrderType.B2C,
      paymentType: PaymentType.PREPAID,
      baseRate: 50.0,
      weightCharge: 10.0,
      codSurcharge: 0.0,
      calculatedCharge: 60.0,
      status: OrderStatus.DELIVERED,
      assignedAgentId: agent1User.agentProfile!.id,
      remarks: 'Delivered successfully and signed by customer.',
    },
  });

  const order1Events = [
    { prev: null, next: OrderStatus.CREATED, actorId: customer1.id, role: Role.CUSTOMER, msg: 'Order created by customer' },
    { prev: OrderStatus.CREATED, next: OrderStatus.ASSIGNED, actorId: adminUser.id, role: Role.ADMIN, msg: 'Assigned to agent Vikram Sethi' },
    { prev: OrderStatus.ASSIGNED, next: OrderStatus.PICKED_UP, actorId: agent1User.id, role: Role.DELIVERY_AGENT, msg: 'Package picked up from Indiranagar' },
    { prev: OrderStatus.PICKED_UP, next: OrderStatus.IN_TRANSIT, actorId: agent1User.id, role: Role.DELIVERY_AGENT, msg: 'In transit via Outer Ring Road' },
    { prev: OrderStatus.IN_TRANSIT, next: OrderStatus.OUT_FOR_DELIVERY, actorId: agent1User.id, role: Role.DELIVERY_AGENT, msg: 'Out for delivery to Koramangala' },
    { prev: OrderStatus.OUT_FOR_DELIVERY, next: OrderStatus.DELIVERED, actorId: agent1User.id, role: Role.DELIVERY_AGENT, msg: 'Handed over to recipient Rahul Sharma' },
  ];

  for (const ev of order1Events) {
    await prisma.trackingEvent.create({
      data: {
        orderId: order1.id,
        prevStatus: ev.prev,
        newStatus: ev.next,
        actorId: ev.actorId,
        actorRole: ev.role,
        remarks: ev.msg,
      },
    });
  }

  await prisma.deliveryAttempt.create({
    data: {
      orderId: order1.id,
      agentId: agent1User.agentProfile!.id,
      attemptNumber: 1,
      status: AttemptStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  // Sample Order 2: CREATED (Unassigned)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'LM-2024-001002',
      customerId: customer2.id,
      pickupAddress: 'Shop 12, Brigade Road',
      pickupPincode: '560001',
      pickupCity: 'Bangalore',
      dropAddress: 'Tower 4, Prestige Ozone, Whitefield',
      dropPincode: '560066',
      dropCity: 'Bangalore',
      pickupZoneId: zoneA.id,
      dropZoneId: zoneB.id,
      length: 40.0,
      breadth: 30.0,
      height: 25.0,
      actualWeight: 4.0,
      volumetricWeight: 6.0,
      billableWeight: 6.0,
      orderType: OrderType.B2C,
      paymentType: PaymentType.COD,
      codAmount: 1500.0,
      baseRate: 100.0,
      weightCharge: 82.5,
      codSurcharge: 30.0,
      calculatedCharge: 212.5,
      status: OrderStatus.CREATED,
      assignedAgentId: null,
      remarks: 'Awaiting dispatch assignment.',
    },
  });

  await prisma.trackingEvent.create({
    data: {
      orderId: order2.id,
      prevStatus: null,
      newStatus: OrderStatus.CREATED,
      actorId: customer2.id,
      actorRole: Role.CUSTOMER,
      remarks: 'Order created with COD, awaiting agent assignment',
    },
  });

  console.log('✅ Orders seeded.');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
