import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticação de usuários
 */
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Faz login e retorna um JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Token retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Erro de validação (dados inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Credenciais inválidas ou token malformado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/login', AuthController.login);

export default router;
