const User = require("../models/user");
const Task = require("../models/task");
const Crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
// const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const MailGen = require("mailgen");
const otpGenerator = require("otp-generator");

exports.findMe = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne(email);
    return res.status(201).json({
      user,
    });
  } catch (error) {
    // console.log("this is error message: " + error.message);
    return res.status(500).json(error);
  }
};
exports.register = async (req, res, next) => {
  // getting the password in order to encrypt the password
  const { password } = req.body;
  console.log(password);
  try {
    // providing the password and password secret token to encrypt the password
    req.body.password = Crypto.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET_KEY
    );
    // creating a new user in db with provided details
    console.log(req.body);
    const user = await User.create(req.body);
    req.userId = user._id;
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    console.log(token);

    // sending user and token as a response.
    console.log(res.status(201).json({ user, token }));
    return res.status(200).json({ user, token });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json(error);
  }
};
exports.sendOtp = async (req, res, next) => {
  const { email } = req.body;
  const new_otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const otp_expiry_time = Date.now() + 10 * 60 * 1000;
  // saving the otp and expire time in user record.
  const user = await User.findOneAndUpdate(
    { email },
    {
      otp: new_otp,
      otp_expiry_time: otp_expiry_time,
    }
  );
  user.otp = new_otp.toString();
  await user.save({ new: true, validateModifiedOnly: true });

  //todo: send an email to user.

  let config = {
    service: "Gmail",
    auth: {
      user: "aayushbhat201@gmail.com",
      pass: "cmljsmxotgyvqirk",
    },
  };
  let transporter = await nodemailer.createTransport(config);
  let MailGenerator = new MailGen({
    theme: "salted",
    product: {
      name: "mailgen",
      link: "https//mailgen.js/",
    },
  });
  let response = {
    body: {
      name: `${user.firstname}`,
      intro: "OTP for authentication",
      table: {
        data: [
          {
            item: "OTP",
            descrpition: "This OTP is valid for 10 minutes only.",
            otp: new_otp,
          },
        ],
      },
    },
  };
  let mail = MailGenerator.generate(response);

  let message = {
    from: "aayushbhat201@gmail.com",
    to: user.email,
    subject: "OTP",
    html: mail,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res.status(200).json({
        status: "success",
        message: "OTP was Sent Successfully",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        status: "error",
        message: "error while sending mail",
        err,
      });
    });
};
exports.verifyOtp = async (req, res, next) => {
  // verify the otp and update the `user record.
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "invalid email or otp expired",
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }
  // const otpString = this.otp.toString();
  // this.otp = await bcrypt.hash(otpString, 12);
  if (!(await user.correctOtp(otp, user.otp))) {
    return res.status(400).json({
      status: "error",
      message: "Otp is incorrect",
    });
  }
  // todo: when otp is correct.
  // user.verified = true;
  const userUpdateVerified = await User.findOneAndUpdate(
    { email },
    {
      verified: true,
    }
  );
  user.otp = undefined;
  await user.save({ new: true, validateModifiedOnly: true });
  // const token = signToken(user._id);c
  // const token = localStorage.getItem("token")
  return res.status(200).json({
    status: "success",
    message: "Otp Verified Successfully.",
    user_id: user._id,
  });
};
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).select("password usernames");
    if (!user) {
      // returning an array of errors so that in frontend i can loop over it and display the error message to particular element/
      return res.status(401).json({
        errors: [
          {
            param: "username",
            msg: "Invalid Username or Password",
          },
        ],
      });
    }
    // DECRYPTING THE USER INPUT PASSWORD
    const decryptPassword = Crypto.AES.decrypt(
      user.password,
      process.env.TOKEN_SECRET_KEY
    ).toString(Crypto.enc.Utf8);
    // convring the case where the user provides the wrong password but right username
    if (decryptPassword !== password) {
      return res.status(401).json({
        errors: [
          {
            param: "username",
            msg: "Invalid Username or Password",
          },
        ],
      });
    }
    user.password = undefined;
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    return res.status(200).json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json(err);
  }
};
