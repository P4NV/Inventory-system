import {
  Controller,
  Get,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Public()
  @Get()
  findAll() {
    return this.itemsService.findAll();
  }
}
