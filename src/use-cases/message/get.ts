import { MessageResponse } from 'src/responses/message-response';
import { MessageRepository } from 'src/repositories/message';

export class GetMessageUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async execute(id: number): Promise<MessageResponse[]> { 
    var response: MessageResponse[] = [];

    let posts = await this.messageRepository.findListByPostId(id);
  
    posts.forEach((item) => {
      response.push({ 
        author: item.user.name,
        message: item.message,
        createdAt: item.createdAt,
      });
    });

    return response;
  }
}
