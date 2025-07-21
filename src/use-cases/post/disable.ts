import { PostRepository } from '../../repositories/post';

export class DisablePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.postRepository.findById(id);
    if (!existing) throw new Error('Postagem não localizada.');
    if (existing.disabled) return;

    await this.postRepository.disable(id);
  }
}
