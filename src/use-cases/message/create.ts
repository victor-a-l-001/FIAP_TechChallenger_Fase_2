import { MessageRepository } from 'src/repositories/message';
import { CreateMessageDTO } from 'src/schemas/message';
import { MessageResponse } from 'src/responses/message-response';
import { UserRepository } from 'src/repositories/user';

export class CreateMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(
    data: CreateMessageDTO,
    userId: number,
  ): Promise<MessageResponse> {
    const message = await this.messageRepository.create({
      message: data.message,
      postId: data.postId,
      userId: userId,
    });

    const user = await this.userRepository.findById(userId);
    return {
      message: message.message,
      author: user?.name,
      createdAt: message.createdAt,
    };
  }
}
