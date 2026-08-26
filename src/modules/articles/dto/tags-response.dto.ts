import { ApiProperty } from '@nestjs/swagger';

export class TagsResponseDto {
  @ApiProperty({ type: [String], example: ['nestjs', 'typeorm'] })
  tags: string[];
}
