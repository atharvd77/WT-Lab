require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");
const { seedDatabase } = require("./src/seed");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connection established successfully.");

    await sequelize.sync({ alter: true });
    console.log("Database synced.");

    await seedDatabase();
    console.log("Database seed check complete.");

    app.listen(PORT, () => {
      console.log(`BOOKVERSE server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
