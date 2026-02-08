const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        minlength: 3
    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't return password by default
    },

    // ===== Metadata =====
    createdAt: {
        type: Date,
        default: Date.now
    } 

}, { timestamps: false });

// ===== Hash password before saving =====
UserSchema.pre("save", async function() {

  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
});

// ===== Method to compare passwords =====
UserSchema.methods.matchPassword = async function(passwordToMatch) {
  return await bcrypt.compare(passwordToMatch, this.password);
};

module.exports = mongoose.model("User", UserSchema);
