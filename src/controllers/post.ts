import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PostRepositoryPrisma } from '../repositories/post-prisma';
import { UserRepositoryPrisma } from '../repositories/user-prisma';
import { 
  UpdatePostSchema,
  SearchPostSchema,
  CreatePostDTO,
} from '../schemas/post';
import { CreatePostUseCase } from '../use-cases/post/create';
import { GetAllPostsUseCase } from '../use-cases/post/get-all';
import { GetPostUseCase } from '../use-cases/post/get';
import { UpdatePostUseCase } from '../use-cases/post/update';
import { DeletePostUseCase } from '../use-cases/post/delete';
import { DisablePostUseCase } from '../use-cases/post/disable';
import { EnablePostUseCase } from '../use-cases/post/enable';
import { SearchPostsUseCase } from '../use-cases/post/search';
import { JwtPayload } from 'src/types/express';

const postRepo = new PostRepositoryPrisma();
const userRepo = new UserRepositoryPrisma();

const createPostUseCase = new CreatePostUseCase(postRepo, userRepo);
const getAllPostsUseCase = new GetAllPostsUseCase(postRepo);
const getPostUseCase = new GetPostUseCase(postRepo);
const updatePostUseCase = new UpdatePostUseCase(postRepo);
const deletePostUseCase = new DeletePostUseCase(postRepo);
const disablePostUseCase = new DisablePostUseCase(postRepo);
const enablePostUseCase = new EnablePostUseCase(postRepo);
const searchPostsUseCase = new SearchPostsUseCase(postRepo);

export class PostController {
  static async create(req: Request, res: Response) {
    try {
      const data = req.body as CreatePostDTO;
      const email = req.user?.user.email!;
      const post = await createPostUseCase.execute(data, email);
      return res.status(201).json(post);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.flatten().fieldErrors });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  static async list(req: Request, res: Response) {
    const user = req.user as JwtPayload;
    const posts = await getAllPostsUseCase.execute(user.userTypeId);
    return res.json(posts);
  }

  static async show(req: Request, res: Response) {
    const id = Number(req.params.id);
    const user = req.user as JwtPayload;
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    try {
      const post = await getPostUseCase.execute(id, user.userTypeId);
      return res.json(post);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    try {
      const data = UpdatePostSchema.parse(req.body);
      const post = await updatePostUseCase.execute(id, data);
      return res.json(post);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.flatten().fieldErrors });
      }
      return res.status(404).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    try {
      await deletePostUseCase.execute(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async disable(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    try {
      await disablePostUseCase.execute(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async enable(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    try {
      await enablePostUseCase.execute(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { q, page, limit } = SearchPostSchema.parse(req.query);
      const user = req.user as JwtPayload;

      const result = await searchPostsUseCase.execute({
        term: q,
        userType: user.userTypeId,
        page,
        limit,
      });

      return res.json(result);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.flatten().fieldErrors });
      }
      return res.status(400).json({ error: err.message });
    }
  }
}
