const { check } = require('express-validator');
const messages = require("./messages")

const mobileValidationString = /^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/gm

const authValidators = {

    login: [
        check('phone').notEmpty().matches(mobileValidationString).withMessage(messages.phoneError),
        check('password').isLength({ min: 6, max: 18 }).withMessage(messages.passwordError),
    ],
    signup: [
        check('full_name').isLength({ min: 3, max: 50 }).withMessage(messages.fullNameError),
        check('phone').notEmpty().matches(mobileValidationString).withMessage(messages.phoneError),
        check('password').isLength({ min: 6, max: 18 }).withMessage(messages.passwordError),
        check('repeat_password').custom(async (repeat_password, { req }) => {
            if (req.body.password !== repeat_password) {
                throw new Error(messages.repeatPasswordError)
            }
        }),
    ],
    verifyNumber: [
        check('phone').notEmpty().matches(mobileValidationString).withMessage(messages.phoneError),
        check('otp').notEmpty().isLength({ min: 4, max: 8 }),
    ],
}
module.exports = authValidators;