import { body } from 'express-validator'

export default [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('address').notEmpty().withMessage('Address is required').trim(),
]
