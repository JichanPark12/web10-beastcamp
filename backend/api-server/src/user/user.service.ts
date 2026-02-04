import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNickname } from '../chat/entities/user-nickname.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserNickname)
    private readonly userNicknameRepository: Repository<UserNickname>,
  ) {}

  async getNicknameByIp(ip: string): Promise<string | null> {
    const user = await this.userNicknameRepository.findOne({
      where: { ip },
    });
    return user?.nickname || null;
  }
}
