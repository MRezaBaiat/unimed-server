import { Injectable } from '@nestjs/common';
import CrashesRepo from '../../databases/crashes.repo';
import { CrashReport, QueryResponse } from 'api';
import SearchQuery from '../../databases/utils/search.query';

@Injectable()
export class CrashesService {
  constructor (private crashesRepo: CrashesRepo) {}

  public async query (query: SearchQuery<CrashReport, {whiteList: string[]}>): Promise<QueryResponse<CrashReport>> {
    const { skip, limit, sort, whiteList, populations, projection } = query;
    const condition = this.crashesRepo.crud()
      .whiteListFilter(whiteList);

    return condition
      .project(projection || { __v: 0 })
      .populate(populations)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .query();
  }
}
