"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const categoria = String(formData.get("categoria") ?? "");
  const brand = String(formData.get("brand") ?? "");
  const price = Number(formData.get("price"));
  const description = String(formData.get("description") ?? "");
  const active = formData.get("active") === "on";

  await prisma.product.update({
    where: { id: productId },
    data: { categoria, brand, price, description, active },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/", "layout");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const categoria = String(formData.get("categoria") ?? "");
  const brand = String(formData.get("brand") ?? "");
  const gender = String(formData.get("gender") ?? "H");
  const prefix = String(formData.get("prefix") ?? "REM");
  const color = String(formData.get("color") ?? "Sin color");
  const price = Number(formData.get("price"));
  const description = String(formData.get("description") ?? "");

  const slug = slugify(`${categoria}-${gender === "H" ? "hombre" : "mujer"}`);

  const product = await prisma.product.create({
    data: { slug, categoria, brand, gender, prefix, color, price, description, active: true },
  });

  revalidatePath("/admin/productos");
  return product.id;
}

export async function addVariant(productId: string, formData: FormData) {
  await requireAdmin();
  const size = String(formData.get("size") ?? "");
  const sku = String(formData.get("sku") ?? "");
  const stock = Number(formData.get("stock") ?? 0);

  await prisma.variant.create({ data: { productId, size, sku, stock } });

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/", "layout");
}

export async function updateVariantStock(variantId: string, productId: string, stock: number) {
  await requireAdmin();
  await prisma.variant.update({ where: { id: variantId }, data: { stock: Math.max(0, stock) } });
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/", "layout");
}

export async function markVariantSold(variantId: string, productId: string) {
  await requireAdmin();
  const variant = await prisma.variant.findUnique({ where: { id: variantId }, include: { product: true } });
  if (!variant) return;

  await prisma.$transaction([
    prisma.variant.update({
      where: { id: variantId },
      data: { stock: Math.max(0, variant.stock - 1) },
    }),
    prisma.sale.create({
      data: {
        productId: variant.product.id,
        categoria: variant.product.categoria,
        brand: variant.product.brand,
        size: variant.size,
        price: variant.product.price,
      },
    }),
  ]);

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/admin/estadisticas");
  revalidatePath("/", "layout");
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdmin();
  await prisma.variant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/", "layout");
}

export async function deleteImage(imageId: string, productId: string) {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (image) {
    const filePath = path.join(process.cwd(), "public", image.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.productImage.delete({ where: { id: imageId } });
  }
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/", "layout");
}

export async function setCoverImage(imageId: string, productId: string) {
  await requireAdmin();
  const target = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!target || target.order === 0) return;

  const current = await prisma.productImage.findFirst({ where: { productId, order: 0 } });

  await prisma.$transaction([
    prisma.productImage.update({ where: { id: target.id }, data: { order: -1 } }),
    ...(current ? [prisma.productImage.update({ where: { id: current.id }, data: { order: target.order } })] : []),
    prisma.productImage.update({ where: { id: target.id }, data: { order: 0 } }),
  ]);

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/", "layout");
}

export async function uploadImage(productId: string, formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const destDir = path.join(process.cwd(), "public", "productos", product.slug);
  fs.mkdirSync(destDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(destDir, fileName), buffer);

  const maxOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { order: true },
  });

  await prisma.productImage.create({
    data: {
      productId,
      url: `/productos/${product.slug}/${fileName}`,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/", "layout");
}
