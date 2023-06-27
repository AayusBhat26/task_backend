const router = require("express").Router();
const userController = require("../controllers/userCont");
const { body } = require("express-validator");
const validation = require("../handlers/validation");
const tokenHandler = require("../handlers/tokenHandler");
const User = require("../models/user");

router.post(
  "/signup",
  body("email")
    .isLength({ min: 12 })
    .withMessage("Provide a valid email address"),
  body("firstname")
    .isLength({ min: 3 })
    .withMessage("First name must of 3 characters atleast"),
  body("lastname")
    .isLength({ min: 3 })
    .withMessage("Last name must of 3 characters atleast"),
  body("username")
    .isLength({ min: 8 })
    .withMessage("username must be at least 8 characters"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  body("confirmPassword")
    .isLength({ min: 8 })
    .withMessage("confirmPassword must be at least 8 characters"),
  body("username").custom((value) => {
    return User.findOne({ username: value }).then((user) => {
      if (user) {
        return Promise.reject("username already used");
      }
    });
  }),
  body("email").custom((value) => {
    return User.findOne({ email: value }).then((user) => {
      if (user) {
        return Promise.reject("email already used");
      }
    });
  }),
  validation.validate,
  userController.register
);

router.post(
  "/login",
  body("username")
    .isLength({ min: 8 })
    .withMessage("username must be at least 8 characters"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  validation.validate,
  userController.login
);

router.post("/verify-token", tokenHandler.verifyToken, (req, res) => {
  return res.status(200).json({ user: req.user });
});


router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.get('/user', userController.findMe);
router.put("/app/pomodoroUpdate", userController.updatePomodoro);
router.put("/app/updatePoints", userController.addPoint);
router.get("/app/getPoints", userController.findMe);
router.put("/app/updateCompleted", userController.updateCompleted);



module.exports = router;
