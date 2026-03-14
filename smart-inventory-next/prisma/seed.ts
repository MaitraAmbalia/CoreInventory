import { PrismaClient, MoveStatus, SustainabilityRisk } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.ghostRecovery.deleteMany();
  await prisma.stockMove.deleteMany();
  await prisma.stockQuant.deleteMany();
  await prisma.location.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userScore.deleteMany();
  await prisma.deliveryProgress.deleteMany();

  const [north, south] = await Promise.all([
    prisma.warehouse.create({ data: { name: "North Hub", code: "NTH" } }),
    prisma.warehouse.create({ data: { name: "South Hub", code: "STH" } })
  ]);

  const locations = await Promise.all([
    prisma.location.create({ data: { name: "Aisle A", code: "NTH-A", activityIndex: 118, removalOrder: 1, warehouseId: north.id } }),
    prisma.location.create({ data: { name: "Aisle B", code: "NTH-B", activityIndex: 74, removalOrder: 2, warehouseId: north.id } }),
    prisma.location.create({ data: { name: "Aisle C", code: "NTH-C", activityIndex: 22, removalOrder: 3, warehouseId: north.id } }),
    prisma.location.create({ data: { name: "Dock 1", code: "STH-D1", activityIndex: 130, removalOrder: 1, warehouseId: south.id } }),
    prisma.location.create({ data: { name: "Rack 9", code: "STH-R9", activityIndex: 16, removalOrder: 2, warehouseId: south.id } })
  ]);

  const products = await Promise.all([
    prisma.product.create({ data: { name: "Eco Bottle 500ml", sku: "ECO-500", qtyAvailable: 320, reorderingMaxQty: 160, sustainabilityRisk: SustainabilityRisk.MEDIUM, lastMoveAt: new Date() } }),
    prisma.product.create({ data: { name: "Steel Flask", sku: "STL-900", qtyAvailable: 80, reorderingMaxQty: 120, sustainabilityRisk: SustainabilityRisk.LOW, lastMoveAt: new Date() } }),
    prisma.product.create({ data: { name: "Legacy Plastic Set", sku: "PLA-OLD", qtyAvailable: 45, reorderingMaxQty: 20, sustainabilityRisk: SustainabilityRisk.HIGH, lastMoveAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) } }),
    prisma.product.create({ data: { name: "Organic Jar", sku: "ORG-JAR", qtyAvailable: 210, reorderingMaxQty: 140, sustainabilityRisk: SustainabilityRisk.MEDIUM, lastMoveAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) } })
  ]);

  await prisma.stockQuant.createMany({
    data: [
      { productId: products[0].id, warehouseId: north.id, locationId: locations[0].id, quantity: 190, reserved: 10 },
      { productId: products[0].id, warehouseId: south.id, locationId: locations[3].id, quantity: 130, reserved: 8 },
      { productId: products[1].id, warehouseId: north.id, locationId: locations[1].id, quantity: 80, reserved: 5 },
      { productId: products[2].id, warehouseId: south.id, locationId: locations[4].id, quantity: 45, reserved: 0 },
      { productId: products[3].id, warehouseId: north.id, locationId: locations[2].id, quantity: 210, reserved: 12 }
    ]
  });

  await prisma.stockMove.createMany({
    data: [
      { productId: products[0].id, quantity: 24, status: MoveStatus.READY, sourceLocationId: locations[0].id, destLocationId: locations[1].id, validatedBy: "Asha" },
      { productId: products[1].id, quantity: 10, status: MoveStatus.WAITING, sourceLocationId: locations[1].id, destLocationId: locations[2].id, validatedBy: "Leo" },
      { productId: products[2].id, quantity: 6, status: MoveStatus.READY, sourceLocationId: locations[4].id, destLocationId: locations[3].id, validatedBy: "Mina" },
      { productId: products[3].id, quantity: 35, status: MoveStatus.DONE, sourceLocationId: locations[2].id, destLocationId: locations[0].id, validatedBy: "Asha", validatedAt: new Date() }
    ]
  });

  await prisma.userScore.createMany({
    data: [
      { name: "Asha Rana", avatarUrl: "https://i.pravatar.cc/100?img=5", points: 42 },
      { name: "Leo Park", avatarUrl: "https://i.pravatar.cc/100?img=12", points: 36 },
      { name: "Mina Patel", avatarUrl: "https://i.pravatar.cc/100?img=24", points: 31 },
      { name: "Ravi Shah", avatarUrl: "https://i.pravatar.cc/100?img=47", points: 27 },
      { name: "Noor Khan", avatarUrl: "https://i.pravatar.cc/100?img=15", points: 21 }
    ]
  });

  await prisma.deliveryProgress.create({
    data: {
      readyCount: 28,
      doneTodayCount: 64
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
