import { body } from 'express-validator'

// Chaining method to validate body
export default [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Email is not valid'),
  body('firstName').notEmpty().withMessage('First name is required').trim(),
  body('lastName').notEmpty().withMessage('Last name is required').trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
]

// Schema Validation method

// export default checkSchema({
//     email: {
//       errorMessage: 'Email is required',
//       notEmpty: true,
//       isEmail: true,
//     },
//   })
