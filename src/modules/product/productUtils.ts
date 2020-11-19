import * as mysql from 'jm-ez-mysql';
import { Tables, ProductTable,CityTable,StateTable,CountryTable ,StoreTable,AttachmentTable,AttachmentThumbTable,ProductimagesTable,ProductreviewTable , UserTable, StorereviewTable} from '../../config/tables';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { isEmpty } from 'lodash';
import { Constants } from '../../config/constants';

export class ProductUtils {
  public async getProduct(sid,productname,latitude,longitude,dsort,psort,lrange,hrange,rating,radius) {
    let search='';
    if(!isEmpty(productname)){
      const strpname = await this.escapeString(productname);
      search = `p.${ProductTable.PRODUCTNAME} like '%${strpname}%' and`;
    }
    let search_store='';
    let distance='';
    if(!isEmpty(sid)){
      search_store = `s.${StoreTable.IS_ENABLE} = 1 AND s.${StoreTable.IS_DELETE} = 0 AND s.${StoreTable.STATUS} = 1 AND s.${StoreTable.ID} = ${sid} and`;
    }else{
      search_store = `s.${StoreTable.IS_ENABLE} = 1 AND s.${StoreTable.IS_DELETE} = 0 AND s.${StoreTable.STATUS} = 1 AND`
      distance= `HAVING distance < ${radius}`;
    }

    let price_range='';
    if(!isEmpty(lrange) && !isEmpty(hrange)){
      price_range = `AND p.${ProductTable.PRICE} BETWEEN ${lrange} AND ${hrange}`;
    }

    let rating_range = '';
    if(!isEmpty(rating)){
      rating_range = `AND pr.${ProductreviewTable.RATING} >= ${rating}`;
    }

    let sorting ='';
    if(!isEmpty(dsort)){
      sorting = `pr.${ProductreviewTable.RATING} ${dsort}`;
    }else if(!isEmpty(psort)){
      sorting= `p.${ProductTable.PRICE} ${psort}`;
    }else{
      sorting=`distance`;
    }

    const result = await mysql.findRaw(`SELECT s.${StoreTable.ID},
      s.${StoreTable.ADDRESSLINE1},
      CONCAT(IF(s.${StoreTable.ADDRESSLINE2} IS NULL,'', s.${StoreTable.ADDRESSLINE2}),'', IF(ci.${CityTable.NAME} IS NULL,'',ci.${CityTable.NAME}), ', ' , IF(st.${StateTable.STATE_CODE} IS NULL,'', st.${StateTable.STATE_CODE}),' ',IF(s.${StoreTable.ZIPCODE} IS NULL,'', s.${StoreTable.ZIPCODE})) AS ${StoreTable.ADDRESSLINE2},
      p.${ProductTable.PRICE},
      p.${ProductTable.UPCCODE},
      p.${ProductTable.PRODUCTNAME},
      p.${ProductTable.DESCRIPTION},
      p.${ProductTable.TITLE},
      p.${ProductTable.CID},
      p.${ProductTable.PID},
      s.${StoreTable.LATITUDE},
      s.${StoreTable.STORENAME},
      s.${StoreTable.LONGITUDE},
      AVG(sr.${StorereviewTable.RATING}) AS storeAverageRating,
      AVG(pr.${ProductreviewTable.RATING}) as averageRating,
      SQRT(POW(69.1 * (s.${StoreTable.LATITUDE} - ${latitude}), 2) + POW(69.1 * (${longitude} - s.${StoreTable.LONGITUDE}) * COS(s.${StoreTable.LATITUDE} / 57.3), 2)) AS distance,
      CONCAT('[', IF(att.${AttachmentTable.ID} IS NULL, '',
        GROUP_CONCAT(DISTINCT(
            JSON_OBJECT(
              'original', att.${AttachmentTable.NAME},
              'thumb', ath.${AttachmentThumbTable.NAME}
            )
            ))),
        ']') AS image
      FROM ${Tables.STORE} s inner join ${Tables.PRODUCT} p on (s.${StoreTable.ID} = p.${ProductTable.STORE_ID})
      INNER JOIN ${Tables.PRODUCTIMAGES} pi on pi.${ProductimagesTable.PID} = p.${ProductTable.PID}
      LEFT JOIN ${Tables.STOREREVIEW} sr on sr.${StorereviewTable.SID} = s.${StoreTable.ID}
      LEFT JOIN ${Tables.ATTACHMENT} att ON att.${AttachmentTable.ID} = pi.${ProductimagesTable.ATTACHMENTID}
      LEFT JOIN ${Tables.ATTACHMENT_THUMB} ath ON ath.${AttachmentThumbTable.ATTACHMENT_ID} = att.${AttachmentTable.ID}
      LEFT JOIN ${Tables.PRODUCTREVIEW} pr on pr.${ProductreviewTable.PID} = p.${ProductTable.PID}
      LEFT JOIN ${Tables.CITIES} ci ON s.${StoreTable.CITY} = ci.${CityTable.ID}
      LEFT JOIN ${Tables.STATES} st ON ci.${CityTable.STATE_ID} = st.${StateTable.ID}
      where ${search} ${search_store} p.${ProductTable.IS_DELETE} = 0 AND p.${ProductTable.PRICE} != 'null' AND p.${ProductTable.IS_ENABLE} = 1 ${price_range} ${rating_range} group by p.${ProductTable.UPCCODE},p.${ProductTable.PRODUCTNAME},p.${ProductTable.STORE_ID} ${distance} ORDER BY ${sorting};`)
    // return result
    if (result.length > 0) {
      return ResponseBuilder.data({ status: true,data:result});
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
  // get product detail by name with product review information and store information.
  // when store id is given it will return searched product on that particular store with the searched product review
  // without store it will return all the store which contain the searched product with the searched product review
  public async getProductByStore(pid,latitude,longitude,upcCode,productname) {
    let condition=``;
    let search;
    if (pid !== '') {
      search = `p.${ProductTable.PID} = ${pid} AND`;
    }else{
      const strpname = await this.escapeString(productname);
      search = await this.searchCondition(upcCode, strpname);
      condition = `GROUP BY p.${ProductTable.UPCCODE}, p.${ProductTable.PRODUCTNAME},s.${StoreTable.ID}`;
    }
    const result = await mysql.findRaw(`SELECT s.${StoreTable.ID},
      AVG(sr.${StorereviewTable.RATING}) AS storeAverageRating,
      s.${StoreTable.ADDRESSLINE1},
      CONCAT(IF(s.${StoreTable.ADDRESSLINE2} IS NULL,'', s.${StoreTable.ADDRESSLINE2}),'', IF(ci.${CityTable.NAME} IS NULL,'',ci.${CityTable.NAME}), ', ' , IF(st.${StateTable.STATE_CODE} IS NULL,'', st.${StateTable.STATE_CODE}),' ',IF(s.${StoreTable.ZIPCODE} IS NULL,'', s.${StoreTable.ZIPCODE})) AS ${StoreTable.ADDRESSLINE2},
      p.${ProductTable.PRICE},
      p.${ProductTable.PRODUCTNAME},
      p.${ProductTable.UPCCODE},
      p.${ProductTable.DESCRIPTION},
      p.${ProductTable.TITLE},
      p.${ProductTable.CID},
      p.${ProductTable.PID},
      s.${StoreTable.LATITUDE},
      s.${StoreTable.STORENAME},
      SQRT(POW(69.1 * (s.${StoreTable.LATITUDE} - ${latitude}), 2) + POW(69.1 * (${longitude} - s.${StoreTable.LONGITUDE}) * COS(s.${StoreTable.LATITUDE} / 57.3), 2)) AS distance,
      CONCAT('[', IF(att.${AttachmentTable.ID} IS NULL, '',
        GROUP_CONCAT(DISTINCT(
            JSON_OBJECT(
              'original', att.${AttachmentTable.NAME},
              'thumb', ath.${AttachmentThumbTable.NAME}
            )
            ))),
        ']') AS image
      FROM ${Tables.STORE} s left join ${Tables.PRODUCT} p on s.${StoreTable.ID} = p.${ProductTable.STORE_ID}
      LEFT JOIN ${Tables.STOREREVIEW} sr on sr.${StorereviewTable.SID} = s.${StoreTable.ID}
      LEFT JOIN ${Tables.PRODUCTIMAGES} pi on pi.${ProductimagesTable.PID} = p.${ProductTable.PID}
      LEFT JOIN ${Tables.ATTACHMENT} att ON att.${AttachmentTable.ID} = pi.${ProductimagesTable.ATTACHMENTID}
      LEFT JOIN ${Tables.ATTACHMENT_THUMB} ath ON ath.${AttachmentThumbTable.ATTACHMENT_ID} = att.${AttachmentTable.ID}
      LEFT JOIN ${Tables.CITIES} ci ON s.${StoreTable.CITY} = ci.${CityTable.ID}
      LEFT JOIN ${Tables.STATES} st ON ci.${CityTable.STATE_ID} = st.${StateTable.ID}
      where ${search} s.${StoreTable.IS_ENABLE} = 1 AND s.${StoreTable.IS_DELETE} = 0 AND s.${StoreTable.STATUS} = 1 AND p.${ProductTable.IS_DELETE} = 0 AND p.${ProductTable.PRICE} != 'null' AND p.${ProductTable.IS_ENABLE} = 1 ${condition}`);
    // return result
    if (result.length > 0) {
      return ResponseBuilder.data({ status: true,data:result});
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }

  public async addReview(productInfo: Json): Promise<ResponseBuilder> {
    const result = await mysql.insert(Tables.PRODUCTREVIEW, productInfo)
    if (result.insertId) {
      return ResponseBuilder.data({ status: true, data: result.insertId });
    } else {
      return ResponseBuilder.data({ status: false, data: result });
    }
  }
  public async escapeString(str){
    return str.replace(/'/g, '\\\'');
  }
  public async searchCondition(upcCode, productname) {
    let search;
    if (upcCode !== '') {
      search = `p.${ProductTable.UPCCODE}=${upcCode} AND`;
    } else {
      const strpname = await this.escapeString(productname);
      search = `p.${ProductTable.PRODUCTNAME} like '%${strpname}%' AND`;
    }
    return search;
  }

}