import KeysOf from '../../utils';

interface BaseQuery<T> {
    projection?: KeysOf<T, 0 | 1> | {[key: string]: 0 | 1},
    populations?: any,
    skip?: number,
    limit?: number,
    sort?: { [key: string]: 0 | -1 | 1 },
    dateRange?:{
        from: number,
        to: number
    },
    search?: string,
}

type SearchQuery<T, E> = BaseQuery<T> & E

export default SearchQuery;
