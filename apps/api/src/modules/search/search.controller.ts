import { Controller, Get, Query } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { SearchQueryDto } from "./search.dto";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  query(@Query() query: SearchQueryDto) {
    return this.searchService.query(query);
  }
}
