import { LostFoundForm } from "@/components/lost-found-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LostFoundPage() {
  const [products, locations] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  ]);

  return <LostFoundForm products={products} locations={locations} />;
}
