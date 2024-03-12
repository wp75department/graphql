const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const crypto = require('crypto');

const resolvers = {
  Query: {
    users: async () => {
      return await User.find();
    },
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      try {
        const user = new User({
          username,
          email,
          password: await bcrypt.hash(password, 10),
        });

        await user.save();
        let token = await jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return { token };
      } catch (error) {
        console.error("Error in register mutation:", error);
        throw new Error("Registration failed");
      }
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Invalid password");
      }
      let token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return { token };
    },
    forgotPassword: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();
      return resetToken;
    },
    resetPassword: async (_, { resetToken, newPassword }) => {
      const user = await User.findOne({ 
        resetToken,
        resetTokenExpiry: { $gt: Date.now() }, // Ensure the reset token is not expired
      });
      if (!user) {
        throw new Error("Invalid or expired reset token");
      }
      // Update password
      user.password = await bcrypt.hash(newPassword, 10);
      // Clear resetToken and resetTokenExpiry
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return "Password reset successfully";
    },
  },
};

module.exports = resolvers;
