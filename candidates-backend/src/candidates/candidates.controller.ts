import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('candidateFile'))
  async uploadCandidate(
    @Body() body: { name: string; surname: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.candidatesService.processCandidate(body.name, body.surname, file);
  }
}
