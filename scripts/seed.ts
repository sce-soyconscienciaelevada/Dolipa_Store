import path from "node:path";
import fs from "node:fs";
import XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { prisma } from "../src/lib/prisma.js";

const VAULT_ROOT = path.resolve(import.meta.dirname, "..", "..");
const XLSX_PATH = path.join(VAULT_ROOT, "stock", "INVENTARIO_TIENDA_NUBE.xlsx");
const MAPPING_CSV_PATH = path.join(VAULT_ROOT, "stock", "_image-mapping.csv");
const PHOTOS_DIR = path.join(VAULT_ROOT, "assets", "photos");
const PUBLIC_PRODUCTS_DIR = path.join(import.meta.dirname, "..", "public", "productos");

const FOLDER_BY_PREFIX: Record<string, Record<string, string>> = {
  REM: { H: "Remeras hombre", M: "Remeras Mujer" },
  BUZ: { H: "buzos y camperas", M: "buzos y camperas" },
  CAM: { H: "buzos y camperas", M: "buzos y camperas" },
  BER: { H: "Bermuda Hombre", M: "Bermuda Hombre" },
  SHO: { H: "Bermuda Hombre", M: "Bermuda Hombre" },
};

const PREFIX_BY_WORD: Record<string, string> = {
  Remera: "REM",
  Buzo: "BUZ",
  Bermuda: "BER",
  Campera: "CAM",
  Short: "SHO",
};

const CATEGORY_WORD_ES: Record<string, string> = {
  REM: "remera",
  BUZ: "buzo",
  BER: "bermuda",
  CAM: "campera",
  SHO: "short",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildDescription(opts: {
  categoria: string;
  marca: string;
  color: string;
  gender: string;
  prefix: string;
}): string {
  const { categoria, marca, color, gender, prefix } = opts;
  const genderWord = gender === "H" ? "hombre" : "mujer";
  const catWord = CATEGORY_WORD_ES[prefix] ?? "prenda";
  const colorPhrase = color && color.toLowerCase() !== "sin color" ? ` color ${color.toLowerCase()}` : "";
  return (
    `${categoria}${colorPhrase}, ${marca} para ${genderWord}. Prenda importada, ` +
    `stock limitado disponible en Dolipa Store, Villa Carlos Paz. ` +
    `Hacemos envíos a todo el Valle de Punilla. Consultá talles disponibles y ` +
    `coordiná tu compra por WhatsApp -- te confirmamos stock real antes de cerrar el pedido.`
  );
}

type Row = {
  Nombre: string;
  Descripcion: string;
  "Precio Venta Unitario (ARS)": number;
  Categoria: string;
  Marca: string;
  SKU: string;
  Stock: number;
  Talle: string;
  Color: string;
  Imagen: string | null;
};

async function main() {
  const wb = XLSX.readFile(XLSX_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet);

  const mappingCsv = fs.readFileSync(MAPPING_CSV_PATH, "utf-8");
  const mappingRows: Array<{
    categoria: string;
    gender: string;
    marca: string;
    sizes: string;
    stock_total: string;
    confidence: string;
    photos: string;
    notes: string;
  }> = parse(mappingCsv, { columns: true, skip_empty_lines: true });

  console.log(`xlsx rows: ${rows.length}, mapping rows: ${mappingRows.length}`);

  await prisma.productImage.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();

  let createdProducts = 0;
  let createdVariants = 0;
  let copiedImages = 0;

  for (const map of mappingRows) {
    const categoria = map.categoria;
    const gender = map.gender;
    const word0 = categoria.split(" ")[0];
    const prefix = PREFIX_BY_WORD[word0] ?? "UNK";

    const matchingRows = rows.filter((r) => {
      const sku = String(r.SKU ?? "");
      const rGender = sku.split("-")[1];
      return r.Categoria === categoria && rGender === gender;
    });

    if (matchingRows.length === 0) {
      console.warn(`SKIP (no xlsx rows found): ${categoria} | ${gender}`);
      continue;
    }

    const price = Number(matchingRows[0]["Precio Venta Unitario (ARS)"]);
    const color = matchingRows[0].Color;
    const marca = map.marca.replace("®", "").trim();
    const slug = slugify(`${categoria}-${gender === "H" ? "hombre" : "mujer"}`);

    const description = buildDescription({ categoria, marca: map.marca, color, gender, prefix });

    const product = await prisma.product.create({
      data: {
        slug,
        categoria,
        brand: marca,
        gender,
        prefix,
        color,
        price,
        description,
        active: true,
      },
    });
    createdProducts++;

    for (const r of matchingRows) {
      await prisma.variant.create({
        data: {
          productId: product.id,
          size: r.Talle,
          sku: String(r.SKU),
          stock: Number(r.Stock),
        },
      });
      createdVariants++;
    }

    const photoFiles = map.photos
      .split(";")
      .map((f) => f.trim())
      .filter(Boolean);

    if (photoFiles.length > 0) {
      const folder = FOLDER_BY_PREFIX[prefix]?.[gender];
      if (!folder) {
        console.warn(`No folder mapping for prefix=${prefix} gender=${gender}, skipping images for ${slug}`);
      } else {
        const destDir = path.join(PUBLIC_PRODUCTS_DIR, slug);
        fs.mkdirSync(destDir, { recursive: true });

        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const srcPath = path.join(PHOTOS_DIR, folder, file);
          if (!fs.existsSync(srcPath)) {
            console.warn(`Missing photo on disk: ${srcPath}`);
            continue;
          }
          const destPath = path.join(destDir, file);
          fs.copyFileSync(srcPath, destPath);
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: `/productos/${slug}/${file}`,
              order: i,
            },
          });
          copiedImages++;
        }
      }
    }

    console.log(`+ ${slug} (${matchingRows.length} variants, ${photoFiles.length} photos)`);
  }

  console.log(`\nDone. products=${createdProducts} variants=${createdVariants} images=${copiedImages}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
