import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

function getProductImages(productName: string, categoryName: string): string[] {
    const nameLower = productName.toLowerCase();

    // Telefon
    if (categoryName === "Telefon") {
        if (nameLower.includes("novaphone")) return [
            "https://images.unsplash.com/photo-1591337676887-a4b10b40e56d?q=80&w=900", // iPhone 12 style
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=900",
            "https://images.unsplash.com/photo-1537589376225-5405c60a5bd8?q=80&w=900"
        ];
        if (nameLower.includes("zenphone")) return [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=900", // Sleek modern phone
            "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=900",
            "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=900"
        ];
        if (nameLower.includes("atlas pro")) return [
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=900", // Samsung style
            "https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=900",
            "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?q=80&w=900"
        ];
        return [
            "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=900", // Generic phone
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bb3?q=80&w=900",
            "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=900"
        ];
    }

    // Kablo & Şarj
    if (categoryName === "Kablo & Şarj") {
        if (nameLower.includes("adaptör") || nameLower.includes("gan")) return [
            "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=900", // Charger block
            "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=900",
        ];
        if (nameLower.includes("powerbank")) return [
            "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=900", // Powerbank
            "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?q=80&w=900",
        ];
        // Standard Cable
        return [
            "https://images.unsplash.com/photo-1531253013824-2c4f03901bfa?q=80&w=900",
            "https://images.unsplash.com/photo-1624831862521-12f8bc1fccc8?q=80&w=900"
        ];
    }

    // Kılıf
    if (categoryName === "Kılıf") {
        if (nameLower.includes("şeffaf")) return [
            "https://images.unsplash.com/photo-1605652538186-b4ad742b6579?q=80&w=900", // Clear case
            "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?q=80&w=900"
        ];
        if (nameLower.includes("derimsi")) return [
            "https://images.unsplash.com/photo-1609692814858-f7cd2f0fea4f?q=80&w=900", // Leather-like
            "https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=900"
        ];
        // Generic Case
        return [
            "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=900", // Colored case
            "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?q=80&w=900"
        ];
    }

    // Ekran Koruyucu
    if (categoryName === "Kırılmaz Cam") {
        return [
            "https://images.unsplash.com/photo-1550029330-94b29315d487?q=80&w=900", // Glass reflection / protection
            "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?q=80&w=900"
        ];
    }

    // Küçük Ev Aletleri
    if (categoryName === "Küçük Ev Aletleri") {
        if (nameLower.includes("blender")) return [
            "https://images.unsplash.com/photo-1585237731934-dfad18c72879?q=80&w=900", // Kitchen appliance
            "https://images.unsplash.com/photo-1574343166542-fbbc5b8cf0f1?q=80&w=900"
        ];
        if (nameLower.includes("airfryer")) return [
            "https://images.unsplash.com/photo-1626806787426-5910811b6325?q=80&w=900", // Appliance setup
            "https://plus.unsplash.com/premium_photo-1663047242194-2790757a70a8?q=80&w=900"
        ];
        // Generic Appliance
        return [
            "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=900",
            "https://images.unsplash.com/photo-1585237731934-dfad18c72879?q=80&w=900"
        ];
    }

    // Default Fallback
    return [
        `https://picsum.photos/seed/${productName}/900/900`,
        `https://picsum.photos/seed/${productName}-alt/900/900`
    ];
}

type SeedProduct = {
    name: string;
    slug: string;
    price: number;
    stock: number;
    description: string;
    images: string[];
};

async function upsertCategory(name: string, slug?: string, parentId?: string | null) {
    const s = slug ?? slugify(name);
    return prisma.category.upsert({
        where: { slug: s },
        update: { name, parentId: parentId ?? null },
        create: { name, slug: s, parentId: parentId ?? null },
    });
}

function makeProductsForCategory(categoryName: string, items: Array<{ name: string; price: number }>): SeedProduct[] {
    return items.map((it, idx) => {
        const slug = `${slugify(categoryName)}-${slugify(it.name)}-${idx + 1}`;
        return {
            name: it.name,
            slug,
            price: it.price,
            stock: Math.floor(Math.random() * 60) + 5,
            description: `${it.name} – demo ürün açıklaması. Ücretsiz kargo ve faturalı gönderim seçenekleri için ürün detaylarını kontrol ediniz.`,
            images: getProductImages(it.name, categoryName),
        };
    });
}

async function main() {
    console.log("🧹 Deleting existing products...");
    await prisma.product.deleteMany({});

    console.log("📁 Creating categories...");
    const catTelefon = await upsertCategory("Telefon", "telefon");
    const catKabloSarj = await upsertCategory("Kablo & Şarj", "kablo-sarj");
    const catKilic = await upsertCategory("Kılıf", "kilif");
    const catKCam = await upsertCategory("Kırılmaz Cam", "kirilmaz-cam");
    const catKucukEv = await upsertCategory("Küçük Ev Aletleri", "kucuk-ev-aletleri");

    console.log("🧾 Building product lists (15 per category)...");
    const telefonProducts = makeProductsForCategory("Telefon", [
        { name: "NovaPhone X12 128GB", price: 31999 },
        { name: "NovaPhone X12 256GB", price: 35999 },
        { name: "ZenPhone Air 128GB", price: 27999 },
        { name: "ZenPhone Air 256GB", price: 31999 },
        { name: "Atlas Pro 5G 128GB", price: 29999 },
        { name: "Atlas Pro 5G 256GB", price: 34999 },
        { name: "Orion S 128GB", price: 23999 },
        { name: "Orion S 256GB", price: 27999 },
        { name: "Mira Lite 64GB", price: 15999 },
        { name: "Mira Lite 128GB", price: 17999 },
        { name: "Pulse Max 5G 128GB", price: 26999 },
        { name: "Pulse Max 5G 256GB", price: 30999 },
        { name: "Vega Note 128GB", price: 21999 },
        { name: "Vega Note 256GB", price: 25999 },
        { name: "Terra Mini 128GB", price: 13999 },
    ]);

    const kabloSarjProducts = makeProductsForCategory("Kablo & Şarj", [
        { name: "Type-C Hızlı Şarj Kablosu 1m (Naylon Örgü)", price: 249 },
        { name: "Type-C Hızlı Şarj Kablosu 2m (Naylon Örgü)", price: 299 },
        { name: "Lightning Kablosu 1m (MFi Uyumlu)", price: 399 },
        { name: "Lightning Kablosu 2m (MFi Uyumlu)", price: 499 },
        { name: "USB-A → Type-C Kablo 1m", price: 179 },
        { name: "USB-A → Type-C Kablo 2m", price: 219 },
        { name: "30W Type-C Hızlı Şarj Adaptörü", price: 699 },
        { name: "45W Type-C Süper Hızlı Şarj Adaptörü", price: 899 },
        { name: "65W GaN Çoklu Şarj Adaptörü (2xType-C+USB)", price: 1499 },
        { name: "20W Type-C Şarj Adaptörü", price: 549 },
        { name: "MagSafe Uyumlu Kablosuz Şarj Standı", price: 999 },
        { name: "15W Kablosuz Şarj Pedi", price: 649 },
        { name: "Powerbank 10.000 mAh (20W PD)", price: 1299 },
        { name: "Powerbank 20.000 mAh (22.5W)", price: 1799 },
        { name: "Araç İçi Hızlı Şarj (Type-C+USB)", price: 799 },
    ]);

    const kilifProducts = makeProductsForCategory("Kılıf", [
        { name: "Şeffaf Silikon Kılıf (Darbe Korumalı)", price: 249 },
        { name: "Mat Silikon Kılıf (Kaydırmaz)", price: 299 },
        { name: "Ultra İnce TPU Kılıf", price: 229 },
        { name: "Magsafe Uyumlu Şeffaf Kılıf", price: 399 },
        { name: "Magsafe Uyumlu Mat Kılıf", price: 449 },
        { name: "Derimsi Kaplama Kılıf (Premium)", price: 549 },
        { name: "Zırhlı Kılıf (360° Koruma)", price: 499 },
        { name: "Standlı Kılıf (Yüzük Stand)", price: 329 },
        { name: "Cüzdan Kılıf (Kartlıklı)", price: 399 },
        { name: "Kamera Korumalı Kılıf", price: 349 },
        { name: "Kayışlı Kılıf (El Askılı)", price: 319 },
        { name: "Renkli Silikon Kılıf (Soft Touch)", price: 289 },
        { name: "Parmak İzi Tutmayan Mat Kılıf", price: 319 },
        { name: "Köşeli Darbe Emici Kılıf", price: 339 },
        { name: "Şeffaf Sert Kılıf (PC)", price: 269 },
    ]);

    const kirilmazCamProducts = makeProductsForCategory("Kırılmaz Cam", [
        { name: "9H Temperli Kırılmaz Cam (Full Cover)", price: 199 },
        { name: "9H Temperli Kırılmaz Cam (2'li Paket)", price: 299 },
        { name: "Anti-Blue Işık Filtreli Cam", price: 349 },
        { name: "Anti-Spy Gizlilik Camı", price: 449 },
        { name: "Mat Ekran Koruyucu (Parmak İzi Azaltır)", price: 299 },
        { name: "Kamera Lens Koruyucu (Metal Çerçeve)", price: 229 },
        { name: "Kamera Lens Koruyucu (3'lü Paket)", price: 299 },
        { name: "Ekran Koruyucu (Hidrojel) – Full", price: 249 },
        { name: "Ekran Koruyucu (Hidrojel) – 2'li", price: 349 },
        { name: "Çentik Uyumlu Full Cover Cam", price: 219 },
        { name: "Darbe Emici Nano Cam", price: 399 },
        { name: "Kolay Uygulama Aparatlı Cam", price: 299 },
        { name: "Apple Uyumlu Full Cover Cam", price: 249 },
        { name: "Android Uyumlu Full Cover Cam", price: 249 },
        { name: "Tablet Temperli Cam (11 inç)", price: 499 },
    ]);

    const kucukEvProducts = makeProductsForCategory("Küçük Ev Aletleri", [
        { name: "Blender Set (1000W) – 2 Başlıklı", price: 2499 },
        { name: "Airfryer 5.5L – Dijital", price: 3999 },
        { name: "Elektrikli Türk Kahvesi Makinesi", price: 1899 },
        { name: "Tost Makinesi – Granit Plaka", price: 2199 },
        { name: "Su Isıtıcı (Kettle) – 1.7L", price: 999 },
        { name: "Mini Doğrayıcı – 500W", price: 1099 },
        { name: "Dikey Süpürge – 18KPa", price: 5499 },
        { name: "Robot Süpürge – WiFi Haritalama", price: 12999 },
        { name: "Ütü – 2600W Buharlı", price: 2499 },
        { name: "Saç Kurutma Makinesi – 2200W", price: 1299 },
        { name: "Saç Düzleştirici – Seramik Plaka", price: 999 },
        { name: "Mikser – 5 Hız", price: 899 },
        { name: "Elektrikli Izgara – 2000W", price: 2999 },
        { name: "Narenciye Sıkacağı", price: 799 },
        { name: "El Blender – 800W", price: 1499 },
    ]);

    console.log("🚀 Inserting products...");

    await prisma.product.createMany({
        data: telefonProducts.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            description: p.description,
            images: p.images,
            categoryId: catTelefon.id,
        })) as any,
        skipDuplicates: true,
    });

    await prisma.product.createMany({
        data: kabloSarjProducts.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            description: p.description,
            images: p.images,
            categoryId: catKabloSarj.id,
        })) as any,
        skipDuplicates: true,
    });

    await prisma.product.createMany({
        data: kilifProducts.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            description: p.description,
            images: p.images,
            categoryId: catKilic.id,
        })) as any,
        skipDuplicates: true,
    });

    await prisma.product.createMany({
        data: kirilmazCamProducts.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            description: p.description,
            images: p.images,
            categoryId: catKCam.id,
        })) as any,
        skipDuplicates: true,
    });

    await prisma.product.createMany({
        data: kucukEvProducts.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            stock: p.stock,
            description: p.description,
            images: p.images,
            categoryId: catKucukEv.id,
        })) as any,
        skipDuplicates: true,
    });

    const total = await prisma.product.count();
    console.log(`✅ Done. Total products in DB: ${total}`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });