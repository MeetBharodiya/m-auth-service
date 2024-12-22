import { body } from 'express-validator'

// Chaining method to validate body
export default [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Email is not valid'),
  body('password').notEmpty().withMessage('Password is required').trim(),
]
