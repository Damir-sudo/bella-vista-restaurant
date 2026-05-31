/* eslint-disable no-console */
import { PrismaClient, Prisma, SpiceLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type SeedCategory = {
  name: string;
  description: string;
  image: string;
  items: SeedItem[];
};

type SeedItem = {
  name: string;
  description: string;
  ingredients: string;
  price: number;
  image: string;
  isFeatured?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: SpiceLevel;
  calories?: number;
  prepTimeMin?: number;
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const CATALOG: SeedCategory[] = [
  {
    name: 'Antipasti',
    description: 'Traditional starters to awaken the palate.',
    image: img('photo-1541529086526-db283c563270'),
    items: [
      {
        name: 'Bruschetta al Pomodoro',
        description: 'Toasted sourdough crowned with vine tomatoes, basil and Ligurian olive oil.',
        ingredients: 'Sourdough, tomato, basil, garlic, extra virgin olive oil',
        price: 11.5,
        image: img('photo-1572695157366-5e585ab2b69f'),
        isVegetarian: true,
        isFeatured: true,
        calories: 240,
        prepTimeMin: 10,
      },
      {
        name: 'Burrata Pugliese',
        description: 'Creamy burrata, heirloom tomatoes, aged balsamic and toasted pine nuts.',
        ingredients: 'Burrata, heirloom tomato, balsamic, pine nuts, basil',
        price: 16.0,
        image: img('photo-1551183053-bf91a1d81141'),
        isVegetarian: true,
        isGlutenFree: true,
        calories: 320,
        prepTimeMin: 8,
      },
      {
        name: 'Calamari Fritti',
        description: 'Golden fried calamari with lemon and a spiced arrabbiata aioli.',
        ingredients: 'Calamari, semolina, lemon, chili aioli',
        price: 15.5,
        image: img('photo-1604909052743-94e838986d24'),
        spiceLevel: 'MILD',
        calories: 410,
        prepTimeMin: 12,
      },
      {
        name: 'Insalata Caprese',
        description: 'Buffalo mozzarella, sun-ripened tomatoes and basil with olive oil.',
        ingredients: 'Buffalo mozzarella, tomato, basil, olive oil',
        price: 13.5,
        image: img('photo-1608897013039-887f21d8c804'),
        isVegetarian: true,
        isGlutenFree: true,
        calories: 280,
        prepTimeMin: 7,
      },
    ],
  },
  {
    name: 'Pasta',
    description: 'Hand-made pasta, the heart of our kitchen.',
    image: img('photo-1551892374-ecf8754cf8b0'),
    items: [
      {
        name: 'Tagliatelle al Tartufo',
        description: 'Silky tagliatelle in butter sauce finished with shaved black truffle.',
        ingredients: 'Egg tagliatelle, black truffle, parmigiano, butter',
        price: 26.0,
        image: img('photo-1473093295043-cdd812d0e601'),
        isVegetarian: true,
        isFeatured: true,
        calories: 620,
        prepTimeMin: 18,
      },
      {
        name: 'Spaghetti alle Vongole',
        description: 'Spaghetti with fresh clams, white wine, garlic and parsley.',
        ingredients: 'Spaghetti, clams, white wine, garlic, parsley, chili',
        price: 23.5,
        image: img('photo-1563379926898-05f4575a45d8'),
        spiceLevel: 'MILD',
        calories: 540,
        prepTimeMin: 16,
      },
      {
        name: 'Lasagna della Nonna',
        description: 'Layered ragù, béchamel and parmigiano baked until bubbling.',
        ingredients: 'Pasta sheets, beef ragù, béchamel, parmigiano',
        price: 21.0,
        image: img('photo-1574894709920-11b28e7367e3'),
        isFeatured: true,
        calories: 720,
        prepTimeMin: 22,
      },
      {
        name: 'Penne all’Arrabbiata',
        description: 'Penne in a fiery tomato sauce with garlic and Calabrian chili.',
        ingredients: 'Penne, tomato, garlic, Calabrian chili, parsley',
        price: 18.0,
        image: img('photo-1608219992759-8d74ed8d76eb'),
        isVegan: true,
        spiceLevel: 'HOT',
        calories: 480,
        prepTimeMin: 14,
      },
      {
        name: 'Risotto ai Funghi Porcini',
        description: 'Carnaroli rice slow-stirred with porcini mushrooms and parmigiano.',
        ingredients: 'Carnaroli rice, porcini, parmigiano, white wine, butter',
        price: 22.0,
        image: img('photo-1476124369491-e7addf5db371'),
        isVegetarian: true,
        isGlutenFree: true,
        calories: 560,
        prepTimeMin: 20,
      },
    ],
  },
  {
    name: 'Pizza',
    description: 'Wood-fired Neapolitan pizza, blistered and fragrant.',
    image: img('photo-1513104890138-7c749659a591'),
    items: [
      {
        name: 'Margherita DOP',
        description: 'San Marzano tomato, fior di latte, fresh basil and olive oil.',
        ingredients: 'Tomato DOP, fior di latte, basil, olive oil',
        price: 16.5,
        image: img('photo-1604068549290-dea0e4a305ca'),
        isVegetarian: true,
        isFeatured: true,
        calories: 680,
        prepTimeMin: 12,
      },
      {
        name: 'Diavola',
        description: 'Spicy salame, tomato, mozzarella and a drizzle of chili honey.',
        ingredients: 'Tomato, mozzarella, spicy salame, chili honey',
        price: 19.0,
        image: img('photo-1628840042765-356cda07504e'),
        spiceLevel: 'MEDIUM',
        calories: 780,
        prepTimeMin: 13,
      },
      {
        name: 'Quattro Formaggi',
        description: 'Mozzarella, gorgonzola, fontina and parmigiano on a white base.',
        ingredients: 'Mozzarella, gorgonzola, fontina, parmigiano',
        price: 20.0,
        image: img('photo-1593560708920-61dd98c46a4e'),
        isVegetarian: true,
        calories: 820,
        prepTimeMin: 13,
      },
    ],
  },
  {
    name: 'Secondi',
    description: 'Hearty mains from land and sea.',
    image: img('photo-1544025162-d76694265947'),
    items: [
      {
        name: 'Osso Buco alla Milanese',
        description: 'Braised veal shank with gremolata over saffron risotto.',
        ingredients: 'Veal shank, white wine, gremolata, saffron risotto',
        price: 34.0,
        image: img('photo-1432139555190-58524dae6a55'),
        isGlutenFree: true,
        isFeatured: true,
        calories: 760,
        prepTimeMin: 28,
      },
      {
        name: 'Branzino al Forno',
        description: 'Whole roasted sea bass with herbs, lemon and capers.',
        ingredients: 'Sea bass, lemon, capers, rosemary, olive oil',
        price: 31.0,
        image: img('photo-1519708227418-c8fd9a32b7a2'),
        isGlutenFree: true,
        calories: 520,
        prepTimeMin: 25,
      },
      {
        name: 'Bistecca alla Fiorentina',
        description: 'Dry-aged T-bone grilled over oak, rosemary and Tuscan olive oil.',
        ingredients: 'Dry-aged T-bone, rosemary, sea salt, olive oil',
        price: 48.0,
        image: img('photo-1600891964092-4316c288032e'),
        isGlutenFree: true,
        isFeatured: true,
        calories: 900,
        prepTimeMin: 30,
      },
    ],
  },
  {
    name: 'Dolci',
    description: 'Sweet endings, made in-house daily.',
    image: img('photo-1571877227200-a0d98ea607e9'),
    items: [
      {
        name: 'Tiramisù Classico',
        description: 'Espresso-soaked savoiardi, mascarpone cream and cocoa.',
        ingredients: 'Savoiardi, espresso, mascarpone, cocoa',
        price: 10.0,
        image: img('photo-1571877227200-a0d98ea607e9'),
        isVegetarian: true,
        isFeatured: true,
        calories: 420,
        prepTimeMin: 6,
      },
      {
        name: 'Panna Cotta ai Frutti di Bosco',
        description: 'Silky vanilla panna cotta with a wild-berry coulis.',
        ingredients: 'Cream, vanilla, gelatin, mixed berries',
        price: 9.0,
        image: img('photo-1488477181946-6428a0291777'),
        isVegetarian: true,
        isGlutenFree: true,
        calories: 350,
        prepTimeMin: 5,
      },
      {
        name: 'Cannoli Siciliani',
        description: 'Crisp shells filled with sweet ricotta, candied orange and pistachio.',
        ingredients: 'Pastry shell, ricotta, candied orange, pistachio, chocolate',
        price: 9.5,
        image: img('photo-1607920591413-4ec007e70023'),
        isVegetarian: true,
        calories: 390,
        prepTimeMin: 6,
      },
    ],
  },
  {
    name: 'Beverages',
    description: 'Italian classics, wines and digestivi.',
    image: img('photo-1514362545857-3bc16c4c7d1b'),
    items: [
      {
        name: 'Aperol Spritz',
        description: 'Aperol, prosecco and soda over ice with an orange slice.',
        ingredients: 'Aperol, prosecco, soda, orange',
        price: 12.0,
        image: img('photo-1560512823-829485b8bf24'),
        isVegan: true,
        isGlutenFree: true,
        calories: 180,
        prepTimeMin: 3,
      },
      {
        name: 'Espresso',
        description: 'Single-origin espresso, rich and aromatic.',
        ingredients: 'Arabica espresso',
        price: 4.0,
        image: img('photo-1510707577719-ae7c14805e3a'),
        isVegan: true,
        isGlutenFree: true,
        calories: 5,
        prepTimeMin: 2,
      },
    ],
  },
];

async function main() {
  console.log('▶ Seeding Bella Vista...');

  // 1) Admin + demo customer
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@bellavista.test';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const customerHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', passwordHash: adminHash },
    create: { name: 'Bella Vista Admin', email: adminEmail, passwordHash: adminHash, role: 'ADMIN' },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'guest@bellavista.test' },
    update: {},
    create: {
      name: 'Sofia Romano',
      email: 'guest@bellavista.test',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      phone: '+1 (555) 014-2231',
    },
  });

  console.log(`  ✓ Users: ${admin.email}, ${customer.email}`);

  // 2) Categories + menu items
  let firstItemId: string | null = null;
  for (const [index, cat] of CATALOG.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: { description: cat.description, image: cat.image, sortOrder: index },
      create: {
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        image: cat.image,
        sortOrder: index,
      },
    });

    for (const item of cat.items) {
      const created = await prisma.menuItem.upsert({
        where: { slug: slugify(item.name) },
        update: {
          price: new Prisma.Decimal(item.price),
          description: item.description,
          image: item.image,
          isFeatured: item.isFeatured ?? false,
        },
        create: {
          name: item.name,
          slug: slugify(item.name),
          description: item.description,
          ingredients: item.ingredients,
          price: new Prisma.Decimal(item.price),
          image: item.image,
          categoryId: category.id,
          isFeatured: item.isFeatured ?? false,
          isVegetarian: item.isVegetarian ?? false,
          isVegan: item.isVegan ?? false,
          isGlutenFree: item.isGlutenFree ?? false,
          spiceLevel: item.spiceLevel ?? 'NONE',
          calories: item.calories,
          prepTimeMin: item.prepTimeMin,
        },
      });
      if (!firstItemId) firstItemId = created.id;
    }
    console.log(`  ✓ Category: ${cat.name} (${cat.items.length} items)`);
  }

  // 3) A sample tracked order for the demo customer
  const margherita = await prisma.menuItem.findUnique({ where: { slug: 'margherita-dop' } });
  const tiramisu = await prisma.menuItem.findUnique({ where: { slug: 'tiramisu-classico' } });

  if (margherita && tiramisu) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: 'BV-100001' } });
    if (!existing) {
      const subtotal = margherita.price.toNumber() + tiramisu.price.toNumber();
      const tax = +(subtotal * 0.0825).toFixed(2);
      const deliveryFee = 4.99;
      const total = +(subtotal + tax + deliveryFee).toFixed(2);

      await prisma.order.create({
        data: {
          orderNumber: 'BV-100001',
          userId: customer.id,
          status: 'PREPARING',
          type: 'DELIVERY',
          paymentStatus: 'PAID',
          subtotal: new Prisma.Decimal(subtotal),
          tax: new Prisma.Decimal(tax),
          deliveryFee: new Prisma.Decimal(deliveryFee),
          tip: new Prisma.Decimal(5),
          total: new Prisma.Decimal(total + 5),
          contactName: customer.name,
          contactEmail: customer.email,
          contactPhone: customer.phone ?? '+1 (555) 014-2231',
          addressLine1: '120 Via Roma',
          city: 'New York',
          postalCode: '10012',
          country: 'United States',
          items: {
            create: [
              {
                menuItemId: margherita.id,
                nameSnapshot: margherita.name,
                unitPrice: margherita.price,
                quantity: 1,
                lineTotal: margherita.price,
              },
              {
                menuItemId: tiramisu.id,
                nameSnapshot: tiramisu.name,
                unitPrice: tiramisu.price,
                quantity: 1,
                lineTotal: tiramisu.price,
              },
            ],
          },
          statusEvents: {
            create: [
              { status: 'PENDING', message: 'Order received.' },
              { status: 'CONFIRMED', message: 'Payment confirmed.' },
              { status: 'PREPARING', message: 'Your dishes are being prepared.' },
            ],
          },
        },
      });
      console.log('  ✓ Sample order BV-100001 created');
    }
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
