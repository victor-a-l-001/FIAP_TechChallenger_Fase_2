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
 *     summary: Faz login e define cookie HttpOnly
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Token retornado com sucesso e cookie definido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Erro de validação (dados inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Gera um novo access token a partir do refresh token (cookie HttpOnly)
 *     description: Lê o refresh token do cookie HttpOnly e retorna um novo access token (também atualiza cookies).
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Novo access token emitido e cookies atualizados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Refresh ausente, inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/refresh', AuthController.refresh);

/**
 * @swagger
 * /auth/session:
 *   get:
 *     summary: Retorna o estado da sessão atual (JWT via cookie HttpOnly)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sessão válida
 *         headers:
 *           X-Session-Expires-At:
 *             description: Data/hora (ISO 8601) em que a sessão expira
 *             schema:
 *               type: string
 *               format: date-time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:   { type: string }
 *                     email:  { type: string, format: email }
 *                     roles:
 *                       type: array
 *                       items: { type: string }
 *                 sub:         { type: string, description: "ID do usuário (subject)" }
 *                 userTypeId:  { type: integer }
 *                 exp:         { type: integer, description: "Expiração (epoch seconds)" }
 *                 iat:         { type: integer, description: "Emitido em (epoch seconds)" }
 *       401:
 *         description: Sessão inválida ou expirada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/session', AuthController.session);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Encerra a sessão limpando os cookies HttpOnly
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Logout efetuado
 */
router.post('/logout', AuthController.logout);

export default router;
