import { Injectable } from '@nestjs/common';
import { compare as bcryptCompare, hash as bcryptHash } from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  private readonly hashFn = bcryptHash as unknown as (
    s: string,
    rounds: number,
  ) => Promise<string>;
  private readonly compareFn = bcryptCompare as unknown as (
    s: string,
    hash: string,
  ) => Promise<boolean>;
  async hash(plain: string): Promise<string> {
    const hashed = await this.hashFn(plain, this.saltRounds);
    return hashed;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const matched = await this.compareFn(plain, hash);
    return matched;
  }
}
