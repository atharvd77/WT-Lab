const bcrypt = require("bcryptjs");
const { User, Book } = require("./models");
const { books: seedBooks } = require("./data/demoData");

async function seedDatabase() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@bookverse.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

    const [adminUser] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: "Admin User",
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        phone: "9999999999",
        role: "admin",
        addresses: [],
      },
    });

    if (adminUser && adminUser.role !== "admin") {
      adminUser.role = "admin";
      await adminUser.save();
    }

    const existingBookCount = await Book.count();
    if (existingBookCount === 0) {
      await Book.bulkCreate(
        seedBooks.map((book) => ({
          ...book,
          price: Number(book.price),
          originalPrice: Number(book.originalPrice ?? book.price),
          rating: Number(book.rating || 0),
          numReviews: Number(book.numReviews || 0),
          stock: Number(book.stock || 0),
        })),
      );
      console.log("Seeded default books.");
    }

    return { adminUser };
  } catch (error) {
    console.error("Database seed error:", error);
    throw error;
  }
}

module.exports = { seedDatabase };
