import { body } from 'express-validator'

// Chaining method to validate body
export default [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is invalid'),
]

// Schema Validation method

// export default checkSchema({
//     email: {
//       errorMessage: 'Email is required',
//       notEmpty: true,
//       isEmail: true,
//     },
//   })
