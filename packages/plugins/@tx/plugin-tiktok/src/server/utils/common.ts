import { isArray } from 'lodash';

export function formatEnglishNumber(num) {
  if (num >= 1000000000) {
    return Math.floor((num / 1000000000) * 100) / 100 + 'B';
  } else if (num >= 1000000) {
    return Math.floor((num / 1000000) * 100) / 100 + 'M';
  } else if (num >= 1000) {
    return Math.floor((num / 1000) * 100) / 100 + 'K';
  } else {
    return Math.floor(num).toString();
  }
}

type IQueryCondition = Record<string, any> | Array<Record<string, any>>;

export const parseListFilterCondition = (props: {
  filter: IQueryCondition;
  parseFn: (condition: IQueryCondition, addCondition: (property: string, value: any) => void) => Promise<void>;
}) => {
  const { filter, parseFn } = props;
  const searchMap = new Map<string, any>();

  const addCondition = (property: string, value: any) => searchMap.set(property, value);
  const parse = async (item: IQueryCondition) => {
    if (isArray(item)) {
      for (const it of item) {
        await parse(it);
      }
    } else {
      const $andOrConditionItem = item['$and'];
      if (isArray($andOrConditionItem)) {
        for (const it of $andOrConditionItem) {
          await parse(it);
        }
      } else {
        await parseFn(item, addCondition);
      }
    }
  };

  return async (): Promise<Map<string, any>> => {
    await parse(filter);
    return searchMap;
  };
};

// const filter = {
//   $and: [{ $and: [{ country: { id: { $eq: 1 } } }] }, { $and: [{ searchConditionUid: { $eq: '带货达人榜' } }] }],
// };

// const filter1 = { $and: [{ searchConditionUid: { $eq: '带货达人榜' } }] };

// (async () => {
//   const res = await parseListFilterCondition({
//     filter: filter,
//     async parseFn(condition, add) {
//       console.log(`condition:`, condition);

//       const propeties = Object.keys(condition);

//       for (const propety of propeties) {
//         const kv = condition[propety];
//         // console.log(`propety:`, propety);
//         // console.log(`kv:`, kv);
//         switch (propety) {
//           case 'keyword':
//             add(propety, kv['$includes']);
//             break;
//           case 'search_followers_count':
//             add(propety, kv['$eq']);
//             break;
//           case 'search_digg_count':
//           case 'searchConditionUid':
//             add(propety, kv['$eq']);
//             break;
//           case 'sales_flag':
//             add(propety, kv['$isTruly']);
//             break;
//           case 'is_live':
//             add(propety, kv['$isTruly']);
//             break;
//           case 'country':
//             add(propety, kv['id']['$eq']);
//             break;
//           case 'productionCategory':
//             add(propety, kv['categoryId']['$eq']);
//             break;
//           default:
//             break;
//         }
//       }
//     },
//   })();

//   console.log(`res:`, res);
// })();
