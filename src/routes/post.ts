import { Router } from 'express';
import { PostController } from '../controllers/post';
import { authorize } from '../middlewares/authorize';
import { Roles } from '../types/roles';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Operações de postagem
 */

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Busca postagens por termo.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Resultado da busca.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 */
router.get(
  '/search',
  authorize([Roles.Aluno, Roles.Professor]),
  PostController.search,
);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria uma nova postagem.
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: Postagem criada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 */
router.post('/', authorize([Roles.Professor]), PostController.create);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lista todas as postagens.
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Lista de postagens.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostResponse'
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 */
router.get('/', authorize([Roles.Aluno, Roles.Professor]), PostController.list);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Obtém uma postagem por ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da postagem
 *     responses:
 *       200:
 *         description: Postagem encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
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
  PostController.show,
);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualiza uma postagem existente.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da postagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostInput'
 *     responses:
 *       200:
 *         description: Postagem atualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Erro de validação.
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 *       404:
 *         description: Postagem não encontrada.
 */
router.put('/:id', authorize([Roles.Professor]), PostController.update);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Remove uma postagem.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da postagem
 *     responses:
 *       204:
 *         description: Postagem removida com sucesso.
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 *       404:
 *         description: Postagem não encontrada.
 */
router.delete('/:id', authorize([Roles.Professor]), PostController.delete);

/**
 * @swagger
 * /posts/disable/{id}:
 *   put:
 *     summary: Desabilita uma postagem.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da postagem
 *     responses:
 *       204:
 *         description: Postagem desabilitada.
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 *       404:
 *         description: Postagem não encontrada.
 */
router.put(
  '/disable/:id',
  authorize([Roles.Professor]),
  PostController.disable,
);

/**
 * @swagger
 * /posts/enable/{id}:
 *   put:
 *     summary: Habilita uma postagem.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da postagem
 *     responses:
 *       204:
 *         description: Postagem habilitada.
 *       401:
 *         description: Credenciais inválidas ou token malformado.
 *       403:
 *         description: Perfil de acesso não autorizado.
 *       404:
 *         description: Postagem não encontrada.
 */
router.put('/enable/:id', authorize([Roles.Professor]), PostController.enable);

export default router;
