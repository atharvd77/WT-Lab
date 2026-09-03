const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email and password are required", 400);
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return sendError(res, "User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
    });

    const token = createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    return sendSuccess(
      res,
      { user: safeUser, token },
      "Registration successful",
      201,
    );
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, identifier, username } = req.body;
    const loginIdentifier = email || identifier || username;

    if (!loginIdentifier || !password) {
      return sendError(res, "Email/username and password are required", 400);
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: loginIdentifier }, { name: loginIdentifier }],
      },
    });

    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    return sendSuccess(res, { user: safeUser, token }, "Login successful");
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return sendSuccess(res, null, "Logged out successfully");
});

router.get("/me", async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendError(res, "Not authenticated", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    return sendSuccess(res, { user: safeUser }, "User fetched");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
