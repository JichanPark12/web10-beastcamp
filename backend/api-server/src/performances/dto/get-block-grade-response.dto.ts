import { ApiProperty } from '@nestjs/swagger';
import { BlockGrade } from '../entities/block-grade.entity';

export class GetBlockGradeResponseDto {
  @ApiProperty({ description: '구역 ID', example: 101 })
  blockId: number;

  @ApiProperty({ description: '등급 ID', example: 1 })
  gradeId: number;

  static fromEntity(blockGrade: BlockGrade): GetBlockGradeResponseDto {
    const dto = new GetBlockGradeResponseDto();
    dto.blockId = blockGrade.blockId;
    dto.gradeId = blockGrade.gradeId;
    return dto;
  }

  static fromEntities(blockGrades: BlockGrade[]): GetBlockGradeResponseDto[] {
    return blockGrades.map((bg) => this.fromEntity(bg));
  }
}
