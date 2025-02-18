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

export default { toTypeId };
