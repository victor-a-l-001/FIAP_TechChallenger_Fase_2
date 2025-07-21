import { PostRepository } from '../../repositories/post';

export class DeletePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.postRepository.findById(id);
    if (!existing) throw new Error('Postagem não localizada.');
    await this.postRepository.delete(id);
  }
}
