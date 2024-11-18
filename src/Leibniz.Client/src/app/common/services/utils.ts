import { EntityType } from '../../relationships/domain/entity-type';

const toTypeId = function (type: string): number {
  switch (type) {
    case 'post':
      return 1;
    case 'link':
      return 2;
    case 'area':
      return 3;
    case 'author':
      return 4;
    case 'book':
      return 5;
    case 'period':
      return 6;
    case 'thesis':
      return 7;
    case 'topic':
      return 8;
    case 'unknown':
      return 9;
  }
  return 9;
};

const toEntityType = function (type: number): EntityType {
  switch (type) {
    case 1:
      return 'post';
    case 2:
      return 'link';
    case 3:
      return 'area';
    case 4:
      return 'author';
    case 5:
      return 'book';
    case 6:
      return 'period';
    case 7:
      return 'thesis';
    case 8:
      return 'topic';
    case 9:
      return 'unknown';
  }
  return 'unknown';
};

export default { toTypeId, toEntityType };
