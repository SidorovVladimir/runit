/* eslint-disable no-useless-constructor */

import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Redirect,
  Render,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Snippet } from '../entities/snippet.entity';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import routes from './routes';
import { HttpExceptionFilter } from './exceptions/http-exceptions.filter';

@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
@Controller('admin')
export class SnippetsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('snippets')
  @Render('snippets.pug')
  async findAllSnippets(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  ): Promise<{
    frontendUrl: string;
    snippets: Snippet[];
    currentPage: number;
    routes: typeof routes;
    currentLang: string;
  }> {
    const currentUser = req.user;
    const currentLang = await this.adminsService.getCurrentLang(currentUser.id);
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const take = 10;
    const snippets: Snippet[] = await this.adminsService.findAllSnippets(
      page,
      take,
    );
    return {
      frontendUrl,
      snippets,
      currentPage: page,
      routes,
      currentLang,
    };
  }

  @Delete('snippets/:id')
  @Redirect('/admin/snippets')
  deleteSnippet(@Param('id', ParseIntPipe) snippetId: number): Promise<void> {
    return this.adminsService.deleteSnippet(snippetId);
  }
}
