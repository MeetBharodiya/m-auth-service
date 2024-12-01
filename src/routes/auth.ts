import express from 'express'
import { AuthController } from '../controllers/AuthController'

const router = express.Router()
const authController = new AuthController()

// added (req,res) => function calling to solve bind issue in class methods
router.post('/register', (req, res) => authController.register(req, res))

export default router
