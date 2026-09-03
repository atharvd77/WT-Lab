const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    addresses: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    isbn: { type: DataTypes.STRING, unique: true, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    publisher: { type: DataTypes.STRING, allowNull: true },
    language: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    originalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    coverImage: { type: DataTypes.STRING, allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    rating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    numReviews: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    bestseller: { type: DataTypes.BOOLEAN, defaultValue: false },
    tags: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    tableName: "books",
    timestamps: true,
  },
);

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Book, key: "id" },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "reviews",
    timestamps: true,
  },
);

Review.belongsTo(User, { foreignKey: "userId" });
Review.belongsTo(Book, { foreignKey: "bookId" });
User.hasMany(Review, { foreignKey: "userId" });
Book.hasMany(Review, { foreignKey: "bookId" });

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    items: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "carts",
    timestamps: true,
  },
);

Cart.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Cart, { foreignKey: "userId" });

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    shippingFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentMethod: { type: DataTypes.STRING, defaultValue: "cod" },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    orderStatus: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    razorpayOrderId: { type: DataTypes.STRING, allowNull: true },
    razorpayPaymentId: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "orders",
    timestamps: true,
  },
);

Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Order, key: "id" },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    razorpayOrderId: { type: DataTypes.STRING, allowNull: true },
    razorpayPaymentId: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    status: {
      type: DataTypes.ENUM("created", "paid", "failed", "refunded"),
      defaultValue: "created",
    },
    signature: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "payments",
    timestamps: true,
  },
);

Payment.belongsTo(Order, { foreignKey: "orderId" });
Payment.belongsTo(User, { foreignKey: "userId" });
Order.hasOne(Payment, { foreignKey: "orderId" });

module.exports = { sequelize, User, Book, Review, Cart, Order, Payment };
