import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import type { User } from '@prisma/client'
import { Strategy } from 'passport-local'

import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    })
  }

  async validate(email: string, password: string): Promise<User> {
    return this.authService.validateUser(email, password)
  }
}
