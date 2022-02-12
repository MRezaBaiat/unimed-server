import { Injectable } from '@nestjs/common';
import SearchQuery from '../../databases/utils/search.query';
import { AdminLog, QueryResponse } from 'api/';
import AdminLogsRepo from '../../databases/admin.logs.repo';

@Injectable()
export class AdminLoggerService {
  constructor (private adminLogsRepo: AdminLogsRepo) {}

  public async query (query: SearchQuery<AdminLog, { whiteList?: string[] }>): Promise<QueryResponse<AdminLog>> {
    const { limit, skip, sort, populations, projection, search, whiteList } = query;
    const condition = this.adminLogsRepo.crud()
      .whiteListFilter(whiteList);

    return condition
      .project(projection || { __v: 0 })
      .populate(populations || ['user'])
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .query();

    /* const total = await AdminLogsDB.count(condition);
        const results = await db.find({ condition, projection: { __v: 0 }, populations: ['user'], skip, limit });
        return generateQueryResponse(total, results, skip, limit); */
  }
}
