const User = require("../models/User");
const CompletedCode = require("../models/CompletedCode");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.json(null);
    }

    const user = await User.findById(req.user.id).select("-password");
    // ... rest same

    if (user) {
      const completions = await CompletedCode.find({ userId: req.user.id }, "questionId");
      const completedQuestions = completions.map(c => c.questionId);
      
      const userData = {
        ...user._doc,
        completedQuestions
      };
      return res.json(userData);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};