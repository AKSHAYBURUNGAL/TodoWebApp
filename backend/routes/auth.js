const router = require("express").Router();
const User = require("../models/User");
const Todo = require("../models/Todo");
const { createAuthToken, authenticateRequest } = require("../middleware/auth");
const {
  getNormalizedUserNameKey,
  normalizeUserName,
} = require("../utils/userName");

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
});

const claimLegacyTodosForUser = async (user) => {
  const totalUsers = await User.countDocuments();

  if (totalUsers !== 1) {
    return;
  }

  await Todo.updateMany(
    {
      $or: [
        { ownerId: { $exists: false } },
        { ownerId: null },
      ],
    },
    {
      $set: {
        ownerId: user.id,
        ownerName: user.name,
      },
    }
  );
};

router.post("/register", async (req, res) => {
  try {
    const displayName = normalizeUserName(req.body?.name || "");
    const normalizedName = getNormalizedUserNameKey(displayName);

    if (!displayName) {
      return res.status(400).json({ error: "Name is required" });
    }

    const existingUser = await User.findOne({ normalizedName });

    if (existingUser) {
      return res.status(409).json({ error: "This name is already registered" });
    }

    const user = await User.create({
      name: displayName,
      normalizedName,
    });

    await claimLegacyTodosForUser(user);

    return res.status(201).json({
      token: createAuthToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    return res.status(500).json({ error: "Unable to register user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const displayName = normalizeUserName(req.body?.name || "");
    const normalizedName = getNormalizedUserNameKey(displayName);

    if (!displayName) {
      return res.status(400).json({ error: "Name is required" });
    }

    const user = await User.findOne({ normalizedName });

    if (!user) {
      return res.status(404).json({ error: "Name not found. Register first." });
    }

    await claimLegacyTodosForUser(user);

    return res.json({
      token: createAuthToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    return res.status(500).json({ error: "Unable to log in" });
  }
});

router.get("/me", authenticateRequest, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Error loading current user:", error.message);
    return res.status(500).json({ error: "Unable to load user" });
  }
});

module.exports = router;
