import { Message } from 'src/domain/message';

export interface MessageRepository {
  create(
    data: Omit<Message, 'id' | 'createdAt' | 'user'>,
  ): Promise<Message>;
  findListByPostId(id: number): Promise<Message[]>; 
}
