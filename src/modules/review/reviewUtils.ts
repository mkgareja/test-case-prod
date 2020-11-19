import * as mysql from 'jm-ez-mysql';
import { Tables, ProductTable, StoreTable, StorereviewTable, ProductreviewTable, UserTable } from '../../config/tables';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { EDEADLK } from 'constants';

export class ReviewUtils {
  public async getUsersReviewCount(storeFlag, id, upcCode, productname) {
    let result;
    if (storeFlag === true) {
      result = mysql.findAll(Tables.STOREREVIEW,
        `count(${StorereviewTable.ID}) as total`,
        `${StorereviewTable.IS_DELETE} = 0 AND ${StorereviewTable.IS_ENABLE} = 1
        and ${StorereviewTable.SID} = ${id}`,
        '1=1')
    } else {
      let search;
      if (id !== '') {
        search = `pr.${ProductreviewTable.PID} = ${id}`;
      } else {
        search = await this.searchCondition(upcCode, productname);
      }
      result = mysql.findAll(`${Tables.PRODUCTREVIEW} pr
        LEFT JOIN ${Tables.PRODUCT} p on pr.${ProductreviewTable.PID} = p.${ProductTable.PID}`,
        `count(pr.${ProductreviewTable.ID}) as total`,
        `pr.${ProductreviewTable.IS_DELETE} = 0 AND pr.${ProductreviewTable.IS_ENABLE} = 1
        and ${search}`,
        '1=1');
    }
    return result;
  }
  public async getUsersReview(storeFlag, id, skip, limit, uid, upcCode, productname) {
    const limitQuery = `LIMIT ${(skip - 1) * limit}, ${limit}`
    let table;
    let whereClause;
    let result;
    let select;
    let search;
    let reviewOrder = ``;
    if (storeFlag === true) {
      table = `${Tables.STOREREVIEW} sr
    LEFT JOIN ${Tables.USER} pru on pru.${UserTable.ID} = sr.${StorereviewTable.UID}`;
      select = [
        `pru.${UserTable.FIRSTNAME}`,
        `sr.${StorereviewTable.TITLE}`,
        `sr.${StorereviewTable.ID}`,
        `sr.${StorereviewTable.RATING}`,
        `sr.${StorereviewTable.DESCRIPTION}`,
        `sr.${StorereviewTable.CREATED_AT}`,
        `sr.${StorereviewTable.UID} AS sruid`
      ];

      if (uid !== '') {
        reviewOrder = `ORDER BY sr.${StorereviewTable.UID}=${uid} DESC,sr.${StorereviewTable.ID} DESC`;
      } else {
        reviewOrder = `ORDER BY sr.${StorereviewTable.ID} DESC`;
      }

      whereClause = `sr.${StorereviewTable.IS_ENABLE} = 1 AND sr.${StorereviewTable.IS_DELETE} = 0 AND sr.${StorereviewTable.SID} = ${id} GROUP BY sr.${StorereviewTable.ID} ${reviewOrder} ${limitQuery}`;

    } else {
      table = `${Tables.PRODUCTREVIEW} pr
      LEFT JOIN ${Tables.PRODUCT} p on pr.${ProductreviewTable.PID} = p.${ProductTable.PID}
      LEFT JOIN ${Tables.USER} pru on pru.${UserTable.ID} = pr.${ProductreviewTable.UID}`;
      select = [
        `pru.${UserTable.FIRSTNAME}`,
        `pr.${ProductreviewTable.TITLE}`,
        `pr.${ProductreviewTable.ID} AS ${ProductreviewTable.ID}`,
        `pr.${ProductreviewTable.RATING}`,
        `pr.${ProductreviewTable.DESCRIPTION}`,
        `pr.${ProductreviewTable.CREATED_AT}`,
        `pr.${ProductreviewTable.UID} AS pruid`,
        `p.${ProductTable.PID}`
      ];

      if (uid !== '') {
        reviewOrder = `ORDER BY pr.${ProductreviewTable.UID}=${uid} DESC, pr.${ProductreviewTable.ID} DESC`;
      } else {
        reviewOrder = `ORDER BY pr.${ProductreviewTable.ID} DESC`;
      }

      if(id !== ''){
         search = `pr.${ProductreviewTable.PID} = ${id}`;
      }else{
        search = await this.searchCondition(upcCode, productname);
      }

      whereClause = `pr.${ProductreviewTable.IS_ENABLE} = 1 AND pr.${ProductreviewTable.IS_DELETE} = 0 AND ${search} GROUP BY pr.${ProductreviewTable.ID} ${reviewOrder} ${limitQuery}`;
    }

    result = await mysql.findAll(
      `${table}`,
      `${select}`,
      `${whereClause}`
    )
    // return result
    if (result.length >= 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async addReviewStore(info: Json): Promise<ResponseBuilder> {
    const result = await mysql.insert(Tables.STOREREVIEW, info)
    if (result.insertId) {
      return ResponseBuilder.data({ status: true, data: result.insertId });
    } else {
      return ResponseBuilder.data({ status: false, data: result });
    }
  }
  public async updateReview(id: number, Info: Json,storeFlag): Promise<ResponseBuilder> {
    let result;
    if (storeFlag === true) {
      result = await mysql.updateFirst(Tables.STOREREVIEW, Info, `${StorereviewTable.ID} = ?`, [id]);
    } else {
      result = await mysql.updateFirst(Tables.PRODUCTREVIEW, Info, `${ProductreviewTable.ID} = ?`, [id]);
    }

    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async deleteReview(id: any,storeFlag): Promise<ResponseBuilder> {
    let result;
    if (storeFlag === true) {
      result =  await mysql.delete(Tables.STOREREVIEW, `${StorereviewTable.ID} = ${id}`);
    } else {
      result = await mysql.delete(Tables.PRODUCTREVIEW, `${ProductreviewTable.ID} = ${id}`);
    }
    if (result.affectedRows > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async checkReviewExist(uid, id, isProduct, isActiveCheck) {
    let condition;
    let user;
    if (isProduct === true) {
      if (isActiveCheck === true) {
        condition = `${ProductTable.PID} = ${id} AND ${ProductTable.IS_ENABLE} = 1 AND ${ProductTable.IS_DELETE}=0`;
        user = await mysql.first(Tables.PRODUCT, [ProductTable.PID], condition);
      } else {
        condition = `${ProductreviewTable.UID} = ${uid} AND pid = ${id}`;
        user = await mysql.first(Tables.PRODUCTREVIEW, [ProductreviewTable.ID], condition);
      }
    } else {
      if (isActiveCheck === true) {
        condition = `${StoreTable.ID} = ${id} AND ${StoreTable.IS_ENABLE} =1 AND ${StoreTable.IS_DELETE} = 0 AND ${StoreTable.STATUS}=1`;
        user = await mysql.first(Tables.STORE, [StoreTable.ID], condition);
      } else {
        condition = `${StorereviewTable.UID} = ${uid} AND sid = ${id}`;
        user = await mysql.first(Tables.STOREREVIEW, [StorereviewTable.ID], condition);
      }
    }
    if (user) {
      return ResponseBuilder.data({ status: true });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  public async escapeString(str) {
    return str.replace(/'/g, '\\\'');
  }
  public async searchCondition(upcCode, productname) {
    let search;
    if (upcCode !== '') {
      search = `p.${ProductTable.UPCCODE}=${upcCode}`;
    } else {
      const strpname = await this.escapeString(productname);
      search = `p.${ProductTable.PRODUCTNAME} like '%${strpname}%'`;
    }
    return search;
  }
}