import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'backend',
      status: 'ok',
      routes: ['/health', '/items'],
    };
  }
}
