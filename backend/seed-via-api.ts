const API_URL = process.env.API_URL || 'http://localhost:3000';

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
  { name: 'Patagonia Nano Puff Jacket', sku: 'PAT-NPJ-019', amount: 45, price: 249.00, category: 'clothing' },
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
  { name: 'Irwin Quick-Grip Clamp 6"', sku: 'IRW-QG6-042', amount: 55, price: 14.00, category: 'tools' },

  // Materials
  { name: 'Baltic Birch Plywood 4x8 1/2"', sku: 'BBB-PLY-043', amount: 40, price: 72.00, category: 'materials' },
  { name: 'Maple Hardwood 1x6 8ft', sku: 'MPL-HDW-044', amount: 85, price: 12.00, category: 'materials' },
  { name: 'Walnut Lumber 1x4 8ft', sku: 'WAL-LUM-045', amount: 30, price: 28.00, category: 'materials' },
  { name: 'Aluminum Sheet 4x8 1/8"', sku: 'ALU-SHT-046', amount: 22, price: 85.00, category: 'materials' },
  { name: 'Steel Angle Iron 2x2 20ft', sku: 'STL-ANG-047', amount: 35, price: 24.00, category: 'materials' },
  { name: 'Acrylic Sheet Clear 24x48', sku: 'ACR-CLR-048', amount: 28, price: 42.00, category: 'materials' },
  { name: 'Epoxy Resin 1 Gallon', sku: 'EPO-RES-049', amount: 40, price: 68.00, category: 'materials' },
  { name: 'Wood Glue Titebond III 16oz', sku: 'TIT-GLUE-050', amount: 95, price: 9.00, category: 'materials' },

  // Office
  { name: 'Paper A4 5000 Sheets', sku: 'PAP-A4-5K-051', amount: 120, price: 42.00, category: 'office' },
  { name: 'Pilot G2 Pens 12pk', sku: 'PIL-G2-12-052', amount: 180, price: 14.00, category: 'office' },
  { name: 'Sharpie Markers 12pk', sku: 'SHA-MRK-12-053', amount: 140, price: 11.00, category: 'office' },
  { name: 'Post-it Notes 12 Pads', sku: 'POS-NOTE-054', amount: 200, price: 16.00, category: 'office' },
  { name: 'Fellowes Shredder 12 Sheet', sku: 'FEL-SHR-055', amount: 12, price: 189.00, category: 'office' },
  { name: 'Swingline Stapler 747', sku: 'SWG-STP-056', amount: 55, price: 28.00, category: 'office' },
  { name: 'Expo Markers 16pk', sku: 'EXP-MRK-16-057', amount: 90, price: 18.00, category: 'office' },
  { name: 'Avery Labels 3000ct', sku: 'AVY-LBL-058', amount: 45, price: 32.00, category: 'office' },

  // Sports
  { name: 'Yoga Mat Manduka PRO', sku: 'MAN-PRO-059', amount: 35, price: 120.00, category: 'sports' },
  { name: 'Bowflex SelectTech 552', sku: 'BOW-552-060', amount: 18, price: 429.00, category: 'sports' },
  { name: 'Rogue Kettlebell 35lb', sku: 'ROG-KB35-061', amount: 25, price: 78.00, category: 'sports' },
  { name: 'Theragun PRO', sku: 'THE-PRO-062', amount: 14, price: 599.00, category: 'sports' },
  { name: 'Garmin Forerunner 965', sku: 'GAR-FR965-063', amount: 22, price: 599.00, category: 'sports' },
  { name: 'Concept2 RowErg', sku: 'CON-ROWE-064', amount: 8, price: 990.00, category: 'sports' },
  { name: 'TRX Suspension Trainer', sku: 'TRX-ST-065', amount: 30, price: 199.00, category: 'sports' },
  { name: 'Resistance Bands Set', sku: 'RST-BND-066', amount: 85, price: 29.00, category: 'sports' },

  // Automotive
  { name: 'Mobil 1 Synthetic 5qt', sku: 'MOB-1SYN-067', amount: 65, price: 32.00, category: 'automotive' },
  { name: 'Michelin Pilot Sport 4S', sku: 'MIC-PS4S-068', amount: 28, price: 289.00, category: 'automotive' },
  { name: 'Bosch Icon Wiper Blades', sku: 'BOS-ICN-069', amount: 55, price: 24.00, category: 'automotive' },
  { name: 'Chemical Guys Wash Kit', sku: 'CHG-WSH-070', amount: 40, price: 48.00, category: 'automotive' },
  { name: 'NOCO Genius 10 Charger', sku: 'NOC-GEN10-071', amount: 20, price: 99.00, category: 'automotive' },
  { name: 'DeWalt Jump Starter 2000A', sku: 'DEW-JS2000-072', amount: 15, price: 159.00, category: 'automotive' },

  // Books
  { name: 'Clean Code - Robert Martin', sku: 'BOK-CC-073', amount: 45, price: 42.00, category: 'books' },
  { name: 'Design Patterns - GoF', sku: 'BOK-DP-074', amount: 28, price: 54.00, category: 'books' },
  { name: 'Staff Engineer - Will Larson', sku: 'BOK-SE-075', amount: 35, price: 38.00, category: 'books' },
  { name: 'System Design Interview', sku: 'BOK-SDI-076', amount: 50, price: 34.00, category: 'books' },
  { name: 'Atomic Habits - James Clear', sku: 'BOK-AH-077', amount: 80, price: 18.00, category: 'books' },
  { name: 'The Pragmatic Programmer', sku: 'BOK-TPP-078', amount: 40, price: 48.00, category: 'books' },
];

async function seed() {
  console.log('Seeding database via API...\n');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of items) {
    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isInStock: item.amount > 0 }),
      });

      if (response.ok) {
        const createdItem = await response.json();
        console.log(`✓ Created: ${createdItem.name} (${createdItem.sku}) - ${createdItem.amount} units @ $${createdItem.price}`);
        created++;
      } else if (response.status === 409) {
        console.log(`⊘ Skipped (duplicate SKU): ${item.sku}`);
        skipped++;
      } else {
        const error = await response.text();
        console.error(`✗ Error creating ${item.name}: ${response.status} - ${error}`);
        errors++;
      }
    } catch (error) {
      console.error(`✗ Network error for ${item.name}:`, error.message);
      errors++;
    }
  }

  console.log('\n--- Seeding Complete ---');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors:  ${errors}`);
}

seed().catch(console.error);