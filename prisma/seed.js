"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function slugify(input) {
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
function picsumImages(seed) {
    return [
        "https://picsum.photos/seed/".concat(encodeURIComponent(seed), "-1/900/900"),
        "https://picsum.photos/seed/".concat(encodeURIComponent(seed), "-2/900/900"),
        "https://picsum.photos/seed/".concat(encodeURIComponent(seed), "-3/900/900"),
    ];
}
function upsertCategory(name, slug, parentId) {
    return __awaiter(this, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            s = slug !== null && slug !== void 0 ? slug : slugify(name);
            return [2 /*return*/, prisma.category.upsert({
                    where: { slug: s },
                    update: { name: name, parentId: parentId !== null && parentId !== void 0 ? parentId : null },
                    create: { name: name, slug: s, parentId: parentId !== null && parentId !== void 0 ? parentId : null },
                })];
        });
    });
}
function makeProductsForCategory(categoryName, items) {
    return items.map(function (it, idx) {
        var slug = "".concat(slugify(categoryName), "-").concat(slugify(it.name), "-").concat(idx + 1);
        return {
            name: it.name,
            slug: slug,
            price: it.price,
            stock: Math.floor(Math.random() * 60) + 5,
            description: "".concat(it.name, " \u2013 demo \u00FCr\u00FCn a\u00E7\u0131klamas\u0131. \u00DCcretsiz kargo ve fatural\u0131 g\u00F6nderim se\u00E7enekleri i\u00E7in \u00FCr\u00FCn detaylar\u0131n\u0131 kontrol ediniz."),
            images: picsumImages(slug),
        };
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var catTelefon, catKabloSarj, catKilic, catKCam, catKucukEv, telefonProducts, kabloSarjProducts, kilifProducts, kirilmazCamProducts, kucukEvProducts, total;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🧹 Deleting existing products...");
                    return [4 /*yield*/, prisma.product.deleteMany({})];
                case 1:
                    _a.sent();
                    console.log("📁 Creating categories...");
                    return [4 /*yield*/, upsertCategory("Telefon", "telefon")];
                case 2:
                    catTelefon = _a.sent();
                    return [4 /*yield*/, upsertCategory("Kablo & Şarj", "kablo-sarj")];
                case 3:
                    catKabloSarj = _a.sent();
                    return [4 /*yield*/, upsertCategory("Kılıf", "kilif")];
                case 4:
                    catKilic = _a.sent();
                    return [4 /*yield*/, upsertCategory("Kırılmaz Cam", "kirilmaz-cam")];
                case 5:
                    catKCam = _a.sent();
                    return [4 /*yield*/, upsertCategory("Küçük Ev Aletleri", "kucuk-ev-aletleri")];
                case 6:
                    catKucukEv = _a.sent();
                    console.log("🧾 Building product lists (15 per category)...");
                    telefonProducts = makeProductsForCategory("Telefon", [
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
                    kabloSarjProducts = makeProductsForCategory("Kablo & Şarj", [
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
                    kilifProducts = makeProductsForCategory("Kılıf", [
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
                    kirilmazCamProducts = makeProductsForCategory("Kırılmaz Cam", [
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
                    kucukEvProducts = makeProductsForCategory("Küçük Ev Aletleri", [
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
                    return [4 /*yield*/, prisma.product.createMany({
                            data: telefonProducts.map(function (p) { return ({
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                stock: p.stock,
                                description: p.description,
                                images: p.images,
                                categoryId: catTelefon.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.createMany({
                            data: kabloSarjProducts.map(function (p) { return ({
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                stock: p.stock,
                                description: p.description,
                                images: p.images,
                                categoryId: catKabloSarj.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.createMany({
                            data: kilifProducts.map(function (p) { return ({
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                stock: p.stock,
                                description: p.description,
                                images: p.images,
                                categoryId: catKilic.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.createMany({
                            data: kirilmazCamProducts.map(function (p) { return ({
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                stock: p.stock,
                                description: p.description,
                                images: p.images,
                                categoryId: catKCam.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.createMany({
                            data: kucukEvProducts.map(function (p) { return ({
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                stock: p.stock,
                                description: p.description,
                                images: p.images,
                                categoryId: catKucukEv.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma.product.count()];
                case 12:
                    total = _a.sent();
                    console.log("\u2705 Done. Total products in DB: ".concat(total));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
