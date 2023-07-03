const { validationResult } = require("express-validator/check");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, password, userName } = req.body;
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPw,
      userName: userName,
    });
    const result = await user.save();
    res
      .status(200)
      .json({ message: "User signedup successfully", user: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  const { userName, password } = req.body;

  let loadedUser;
  const user = await User.findOne({ userName: userName });
  if (!user) {
    const error = new Error("A user with this username could not be found.");
    error.statusCode = 401;
    throw error;
  }
  loadedUser = user;

  try {
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userName: loadedUser.userName,
        userId: loadedUser._id.toString(),
      },
      "somesupersecretcodehere",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      msg: "User LoggedIn Successfully",
      token: token,
      userId: loadedUser._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email, username, password } = req.body;

  try {
    const user = await User.findOne({ email, username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = password;
    await user.save();

    const mailOptions = {
      from: "kchahar686@gmail.com",
      to: user.email,
      subject: "Password Reset Confirmation",
      text: "Your password has been reset successfully.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent to reset the password");
      }
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};
