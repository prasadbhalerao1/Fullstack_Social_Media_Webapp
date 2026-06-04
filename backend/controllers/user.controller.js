import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  secure: false,
  sameSite: "strict",
};

const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(422).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    const token = generateToken(savedUser._id);

    const { password: _, ...userData } = savedUser._doc; // Exclude password from the response

    res.status(201).cookie("token", token, cookieOptions).json({
      success: true,
      message: "User registered successfully",
      user: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration error : " + error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(422).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    const { password: _, ...userData } = user._doc; // Exclude password from the response

    res.status(200).cookie("token", token, cookieOptions).json({
      success: true,
      message: "User logged in successfully",
      user: userData,
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Login error : " + error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.status(200).clearCookie("token", cookieOptions).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Logout error : " + error.message });
  }
};

export const profileUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Profile error : " + error.message });
  }
};

export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching users : " + error.message,
      });
  }
};
