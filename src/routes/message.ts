import { Router } from 'express';
import { authorize } from '../middlewares/authorize';
import { Roles } from '../types/roles';
import { MessageController } from '../controllers/message';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Mensagens
 *   description: Operações de Mensagens
 */

/**
 * @swagger
 * /mensagens:
 *   post:
 *     summary: Cria uma nova mensagem.
 *     tags: [Mensagens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageInput'
 *     responses:
 *       201:
 *         description: Postagem criada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 */
router.post(
  '/',
  authorize([Roles.Aluno, Roles.Professor]),
  MessageController.create,
);

/**
 * @swagger
 * /mensagens/{id}:
 *   get:
 *     summary: Obtém mensagens de uma postagem por ID.
 *     tags: [Mensagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da postagem
 *     responses:
 *       200:
 *         description: Mensagens encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 *       404:
 *         description: Postagem não encontrada.
 */
router.get(
  '/:id',
  authorize([Roles.Aluno, Roles.Professor]),
  MessageController.show,
);

export default router;
