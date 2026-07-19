import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.item.findMany({ orderBy: { addedAt: 'desc' } });
  }

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.item.create({ data: dto });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException(`An item with SKU "${dto.sku}" already exists`);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.ensureExists(id);
    return this.prisma.item.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.item.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
  }
}
