import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt.auth.guard';
import CrashesRepo from '../../databases/crashes.repo';

@UseGuards(JwtAuthGuard)
@Controller('crashes')
export class CrashesController {
  constructor (private crashesRepo: CrashesRepo) {}

  @Post('/')
  public handleCreateCrashReport (@Body() body) {
    return this.crashesRepo.crud().create({
      ...body,
      date: Date.now()
    });
  }
}
