import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const items = [
  // Electronics
  { name: 'MacBook Pro 16" M3', sku: 'MBP-M3-16-001', amount: 15, price: 2499.00, category: 'electronics' },
  { name: 'Dell XPS 15', sku: 'DELL-XPS15-002', amount: 22, price: 1899.00, category: 'electronics' },
  { name: 'iPhone 15 Pro', sku: 'IP15P-256-003', amount: 45, price: 999.00, category: 'electronics' },
  { name: 'Samsung Galaxy S24 Ultra', sku: 'SAM-S24U-004', amount: 38, price: 1299.00, category: 'electronics' },
  { name: 'Sony WH-1000XM5', sku: 'SNY-WH1000XM5-005', amount: 60, price: 399.00, category: 'electronics' },
  { name: 'iPad Pro 12.9"', sku: 'IPAD-PRO12-006', amount: 28, price: 1099.00, category: 'electronics' },
  { name: 'Apple Watch Ultra 2', sku: 'AWU2-49-007', amount: 35, price: 799.00, category: 'electronics' },
  { name: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-008', amount: 85, price: 99.00, category: 'electronics' },
  { name: 'Samsung 4K Monitor 32"', sku: 'SAM-MON32-009', amount: 18, price: 549.00, category: 'electronics' },
  { name: 'Razer Huntsman V3 Pro', sku: 'RAZ-HV3P-010', amount: 42, price: 199.00, category: 'electronics' },

  // Furniture
  { name: 'Herman Miller Aeron', sku: 'HMA-AERON-011', amount: 8, price: 1395.00, category: 'furniture' },
  { name: 'Steelcase Leap V2', sku: 'STL-LEAPV2-012', amount: 12, price: 995.00, category: 'furniture' },
  { name: 'IKEA BEKANT Desk', sku: 'IKE-BEKANT-013', amount: 35, price: 299.00, category: 'furniture' },
  { name: 'Secretlab Titan Evo', sku: 'SEC-TITAN-014', amount: 20, price: 549.00, category: 'furniture' },
  { name: 'Uplift V2 Standing Desk', sku: 'UPL-V2-015', amount: 14, price: 699.00, category: 'furniture' },
  { name: 'Herman Miller Sayl', sku: 'HMA-SAYL-016', amount: 16, price: 795.00, category: 'furniture' },
  { name: 'Branch Ergonomic Chair', sku: 'BRN-ERGO-017', amount: 24, price: 329.00, category: 'furniture' },
  { name: 'Fully Jarvis Bamboo', sku: 'FUL-JARVIS-018', amount: 11, price: 579.00, category: 'furniture' },

  // Clothing
  { name: "Patagonia Nano Puff Jacket", sku: 'PAT-NPJ-019', amount: 45, price: 249.00, category: 'clothing' },
  { name: "Arc'teryx Beta AR Jacket", sku: 'ARC-BETA-020', amount: 18, price: 599.00, category: 'clothing' },
  { name: 'Carhartt Duck Jacket', sku: 'CAR-DUCK-021', amount: 52, price: 129.00, category: 'clothing' },
  { name: 'Lululemon ABC Pants', sku: 'LUL-ABC-022', amount: 68, price: 128.00, category: 'clothing' },
  { name: 'Uniqlo Ultra Light Down', sku: 'UNI-ULD-023', amount: 85, price: 69.00, category: 'clothing' },
  { name: 'Columbia Silver Ridge Pants', sku: 'COL-SRP-024', amount: 44, price: 75.00, category: 'clothing' },
  { name: 'Smartwool Merino Socks 3pk', sku: 'SMT-MERINO-025', amount: 120, price: 24.00, category: 'clothing' },
  { name: 'Darn Tough Hiker Socks', sku: 'DAR-HIKER-026', amount: 95, price: 28.00, category: 'clothing' },

  // Food
  { name: 'La Colombe Coffee Beans 12oz', sku: 'LAC-COFF-027', amount: 200, price: 18.00, category: 'food' },
  { name: 'Blue Bottle Coffee 12oz', sku: 'BLB-COFF-028', amount: 150, price: 22.00, category: 'food' },
  { name: 'RXBAR Variety Pack 12ct', sku: 'RXB-VAR-029', amount: 80, price: 28.00, category: 'food' },
  { name: 'Kind Bars Variety 18ct', sku: 'KND-VAR-030', amount: 95, price: 24.00, category: 'food' },
  { name: 'Larabar Fruit & Nut 16ct', sku: 'LAR-FN-031', amount: 70, price: 19.00, category: 'food' },
  { name: 'Epic Bone Broth 16oz', sku: 'EPC-BRB-032', amount: 110, price: 6.00, category: 'food' },
  { name: 'Primal Kitchen Mayo 12oz', sku: 'PRM-MAYO-033', amount: 85, price: 9.00, category: 'food' },
  { name: 'Siete Tortilla Chips', sku: 'SIE-TORT-034', amount: 140, price: 4.00, category: 'food' },

  // Tools
  { name: 'DeWalt 20V Max Drill Kit', sku: 'DEW-DCD771-035', amount: 28, price: 159.00, category: 'tools' },
  { name: 'Milwaukee M18 Impact Driver', sku: 'MIL-M18ID-036', amount: 22, price: 179.00, category: 'tools' },
  { name: 'Makita 18V Circular Saw', sku: 'MAK-18VCS-037', amount: 15, price: 189.00, category: 'tools' },
  { name: 'Bosch Laser Level GLL 3-80', sku: 'BOS-GLL380-038', amount: 18, price: 149.00, category: 'tools' },
  { name: 'Knipex Pliers Wrench 7"', sku: 'KNI-PW7-039', amount: 45, price: 54.00, category: 'tools' },
  { name: 'Wera Kraftform Screwdriver Set', sku: 'WER-KRAFT-040', amount: 35, price: 48.00, category: 'tools' },
  { name: 'Stanley FatMax Tape 25ft', sku: 'STA-FTM25-041', amount: 60, price: 18.00, category: 'tools' },
  { name: 'Irwin Quick-Grip Clamp 6"', sku: 'IRW-QG6-042', amount: 48, price: 22.00, category: 'tools' },

  // Materials
  { name: 'Baltic Birch Plywood 4x8 1/2"', sku: 'BAL-BB-043', amount: 30, price: 68.00, category: 'materials' },
  { name: 'Maple Hardwood 1x6x8ft', sku: 'MAP-HW-044', amount: 45, price: 18.00, category: 'materials' },
  { name: 'Aluminum Sheet 6061 24x24', sku: 'ALU-6061-045', amount: 25, price: 42.00, category: 'materials' },
  { name: 'Stainless Steel Rod 1/2"', sku: 'STS-ROD-046', amount: 40, price: 15.00, category: 'materials' },
  { name: 'ABS Filament 1kg Black', sku: 'ABS-FIL-047', amount: 55, price: 24.00, category: 'materials' },
  { name: 'PLA Filament 1kg White', sku: 'PLA-FIL-048', amount: 60, price: 22.00, category: 'materials' },
  { name: 'Carbon Fiber Sheet 12x12', sku: 'CFB-SHT-049', amount: 18, price: 89.00, category: 'materials' },
  { name: 'Epoxy Resin 1 Gallon', sku: 'EPO-RES-050', amount: 22, price: 75.00, category: 'materials' },

  // Office
  { name: 'Fellowes Laminator Saturn', sku: 'FEL-SAT-051', amount: 28, price: 89.00, category: 'office' },
  { name: 'Swingline Stapler 747', sku: 'SWG-747-052', amount: 65, price: 28.00, category: 'office' },
  { name: 'Post-it Notes 12pk', sku: 'POS-NOTE-053', amount: 150, price: 14.00, category: 'office' },
  { name: 'Sharpie Permanent Markers 12ct', sku: 'SHA-MARK-054', amount: 90, price: 12.00, category: 'office' },
  { name: 'BIC Ballpoint Pens 60ct', sku: 'BIC-PEN-055', amount: 80, price: 8.00, category: 'office' },
  { name: 'Avery File Folders 50ct', sku: 'AVE-FLD-056', amount: 55, price: 18.00, category: 'office' },
  { name: 'Scotch Tape 6pk', sku: 'SCO-TAPE-057', amount: 95, price: 11.00, category: 'office' },
  { name: 'Paper Clips Jumbo 1000ct', sku: 'PAP-CLIP-058', amount: 40, price: 6.00, category: 'office' },

  // Sports
  { name: 'Wilson Evolution Basketball', sku: 'WIL-EVO-059', amount: 25, price: 69.00, category: 'sports' },
  { name: 'Nike Dri-FIT Shirts 3pk', sku: 'NIKE-DRI-060', amount: 70, price: 45.00, category: 'sports' },
  { name: 'Yeti Rambler 26oz', sku: 'YET-RAM-061', amount: 45, price: 39.00, category: 'sports' },
  { name: 'Theragun Mini', sku: 'THE-MINI-062', amount: 18, price: 199.00, category: 'sports' },
  { name: 'Resistance Bands Set 5pc', sku: 'RES-BAND-063', amount: 55, price: 24.00, category: 'sports' },
  { name: 'Manduka PRO Yoga Mat', sku: 'MAN-PRO-064', amount: 22, price: 130.00, category: 'sports' },
  { name: 'Garmin Forerunner 265', sku: 'GAR-FR265-065', amount: 15, price: 449.00, category: 'sports' },
  { name: 'Hydro Flask 32oz', sku: 'HYD-FL32-066', amount: 50, price: 44.00, category: 'sports' },

  // Automotive
  { name: 'Mobil 1 Synthetic 5qt', sku: 'MOB-1-5QT-067', amount: 60, price: 28.00, category: 'automotive' },
  { name: 'Michelin Defender Tires 4pk', sku: 'MIC-DEF-068', amount: 12, price: 720.00, category: 'automotive' },
  { name: 'Bosch Wiper Blades 26"', sku: 'BOS-WIP-069', amount: 45, price: 24.00, category: 'automotive' },
  { name: 'Chemical Guys Wash Kit', sku: 'CHG-WASH-070', amount: 30, price: 49.00, category: 'automotive' },
  { name: 'NOCO Genius 10A Charger', sku: 'NOC-G10-071', amount: 22, price: 89.00, category: 'automotive' },
  { name: 'Gorilla Glue 4oz', sku: 'GOR-GLUE-072', amount: 55, price: 7.00, category: 'automotive' },
  { name: '3M Duct Tape Silver', sku: '3M-DUCT-073', amount: 40, price: 9.00, category: 'automotive' },
  { name: 'WD-40 Specialist 11oz', sku: 'WD40-SP-074', amount: 65, price: 6.00, category: 'automotive' },

  // Books
  { name: 'Clean Code - Robert Martin', sku: 'BOK-CC-075', amount: 35, price: 42.00, category: 'books' },
  { name: 'Design Patterns - GoF', sku: 'BOK-DP-076', amount: 28, price: 54.00, category: 'books' },
  { name: 'The Pragmatic Programmer', sku: 'BOK-TPP-077', amount: 40, price: 38.00, category: 'books' },
  { name: 'System Design Interview', sku: 'BOK-SDI-078', amount: 45, price: 39.00, category: 'books' },
  { name: 'Atomic Habits - James Clear', sku: 'BOK-AH-079', amount: 60, price: 18.00, category: 'books' },
  { name: 'Deep Work - Cal Newport', sku: 'BOK-DW-080', amount: 38, price: 22.00, category: 'books' },
  { name: 'Staff Engineer - Will Larson', sku: 'BOK-SE-081', amount: 25, price: 45.00, category: 'books' },
  { name: 'Engineering Management', sku: 'BOK-EM-082', amount: 20, price: 52.00, category: 'books' },
];

async function main() {
  console.log('🌱 Seeding database with diverse inventory items...');
  
  let created = 0;
  let skipped = 0;
  
  for (const item of items) {
    try {
      const existing = await prisma.item.findUnique({ where: { sku: item.sku } });
      if (existing) {
        console.log(`⏭  Skipping ${item.sku} - already exists`);
        skipped++;
        continue;
      }
      
      await prisma.item.create({ data: item });
      console.log(`✅ Created ${item.sku} - ${item.name} ($${item.price}) x${item.amount}`);
      created++;
    } catch (error) {
      console.error(`❌ Failed to create ${item.sku}:`, error);
    }
  }
  
  const total = await prisma.item.count();
  console.log(`\n📊 Seed complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total items in DB: ${total}`);

  // Seed users
  console.log('\n👥 Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log(`✅ Admin: ${admin.email} (role: ${admin.role})`);

  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      password: hashedPassword,
      name: 'Guest User',
      role: 'user',
    },
  });
  console.log(`✅ Guest: ${guest.email} (role: ${guest.role})`);
  console.log('\n🔑 Default password for both: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });