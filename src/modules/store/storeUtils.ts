import * as mysql from 'jm-ez-mysql';
import { Tables, ProductreviewTable,StorereviewTable,ProductTable, CityTable, StateTable, CountryTable, ProductimagesTable, StoreTable, OpeninghoursTable, StoreownerTable, AttachmentTable, AttachmentThumbTable, CategoryTable } from '../../config/tables';
import { ResponseBuilder } from '../../helpers/responseBuilder';
import { isEmpty } from 'lodash';

export class StoreUtils {
  // get store by id with product on store id
  // category name on store id
  // distance by lat long
  public async getStore(isStore,id,latitude,longitude) {
    let condition;
    if(id !==''){
    if(!isEmpty(isStore)){
      condition = `WHERE s.${StoreTable.ID} = ${id} AND s.${StoreTable.IS_ENABLE} = 1 AND s.${StoreTable.IS_DELETE} = 0 AND s.${StoreTable.STATUS} = 1`;
    }else{
      condition = `WHERE c.${CategoryTable.ID} = ${id} AND s.${StoreTable.IS_ENABLE} = 1 AND s.${StoreTable.IS_DELETE} = 0 AND s.${StoreTable.STATUS} = 1 GROUP BY s.${StoreTable.ID} ORDER BY distance`;
    }
    }else{
      condition = `WHERE s.${StoreTable.IS_ENABLE} = 1 AND s.${StoreTable.IS_DELETE} = 0 AND s.${StoreTable.STATUS} = 1 GROUP BY s.${StoreTable.ID} ORDER BY distance`;
    }
    const result =  await mysql.findRaw(`SELECT
      c.${CategoryTable.CATEGORY_NAME},
      s.${StoreTable.ID},
      s.${StoreTable.STORENAME},
      s.${StoreTable.ADDRESSLINE1},
      CONCAT(IF(s.${StoreTable.ADDRESSLINE2} IS NULL,'', s.${StoreTable.ADDRESSLINE2}),'', IF(ci.${CityTable.NAME} IS NULL,'',ci.${CityTable.NAME}), ', ' , IF(st.${StateTable.STATE_CODE} IS NULL,'', st.${StateTable.STATE_CODE}),' ',IF(s.${StoreTable.ZIPCODE} IS NULL,'', s.${StoreTable.ZIPCODE})) AS ${StoreTable.ADDRESSLINE2},
      so.${StoreownerTable.EMAIL},
      s.${StoreTable.MOBILE_NUMBER},
      so.${StoreownerTable.EMAIL},
      AVG(sr.${StorereviewTable.RATING}) AS storeAverageRating,
      COUNT(sr.${StorereviewTable.ID}) AS totalReview,
      CONCAT(IF(att.${AttachmentTable.ID} IS NULL AND ath.${AttachmentThumbTable.ATTACHMENT_ID} IS NULL, '',
      JSON_OBJECT(
        'id', att.${AttachmentTable.ID},
        'original', att.${AttachmentTable.NAME},
        'thumb', ath.${AttachmentThumbTable.NAME}
      ))) AS image,
      SQRT(POW(69.1 * (s.${StoreTable.LATITUDE} - ${latitude}), 2) + POW(69.1 * (${longitude} - s.${StoreTable.LONGITUDE}) * COS(s.${StoreTable.LATITUDE} / 57.3), 2)) AS distance
      FROM ${Tables.STORE} s LEFT JOIN ${Tables.STOREOWNER} so  on s.${StoreTable.SOID} = so.${StoreownerTable.ID}
      LEFT JOIN ${Tables.ATTACHMENT} att ON att.${AttachmentTable.ID} = s.${StoreTable.PROFILE_IMAGE_ID}
      LEFT JOIN ${Tables.STOREREVIEW} sr on sr.${StorereviewTable.SID} = s.${StoreTable.ID}
      LEFT JOIN ${Tables.ATTACHMENT_THUMB} ath ON ath.${AttachmentThumbTable.ATTACHMENT_ID} = att.${AttachmentTable.ID}
      LEFT JOIN ${Tables.CATEGORY} c ON s.${StoreTable.CATEGORY_ID} = c.${CategoryTable.ID}
      LEFT JOIN ${Tables.CITIES} ci ON s.${StoreTable.CITY} = ci.${CityTable.ID}
      LEFT JOIN ${Tables.STATES} st ON ci.${CityTable.STATE_ID} = st.${StateTable.ID}
      ${condition};`)

      if (result.length > 0) {
        return ResponseBuilder.data({ status: true, data:result});
        } else {
          return ResponseBuilder.data({ status: false });
        }
  }
  // product review on product id
  // avg rating by AVG
  public async getProductsByStore(id) {
    return await mysql.findRaw(`SELECT
      AVG(pr.${ProductreviewTable.RATING}) as product_avg_rating,
      p.${ProductTable.PID},
      p.${ProductTable.PRODUCTNAME},
      p.${ProductTable.UPCCODE},
      p.${ProductTable.TITLE},
      p.${ProductTable.DESCRIPTION},
      CONCAT(IF(att.${AttachmentTable.ID} IS NULL AND ath.${AttachmentThumbTable.ATTACHMENT_ID} IS NULL, '',
      JSON_OBJECT(
        'id', att.${AttachmentTable.ID},
        'original', att.${AttachmentTable.NAME},
        'thumb', ath.${AttachmentThumbTable.NAME}
      ))) AS image
      FROM ${Tables.STORE} s inner join ${Tables.PRODUCT} p on (s.${StoreTable.ID} = p.${ProductTable.STORE_ID}) 
      LEFT JOIN ${Tables.PRODUCTIMAGES} pi on pi.${ProductimagesTable.PID} = p.${ProductTable.PID}  
      LEFT JOIN ${Tables.ATTACHMENT} att ON att.${AttachmentTable.ID} = pi.${ProductimagesTable.ATTACHMENTID}
      LEFT JOIN ${Tables.ATTACHMENT_THUMB} ath ON ath.${AttachmentThumbTable.ATTACHMENT_ID} = att.${AttachmentTable.ID}
      LEFT JOIN ${Tables.PRODUCTREVIEW} pr ON p.${ProductTable.PID} = pr.${ProductreviewTable.PID}
      WHERE s.${StoreTable.ID} = ${id} AND p.${ProductTable.IS_ENABLE} = 1 AND p.${ProductTable.PRICE} != 'null' AND p.${ProductTable.IS_DELETE} = 0 GROUP BY p.${ProductTable.PID};`)
  }
  public async getStoreTime(id: number) {
    const result = await mysql.findAll(Tables.OPENINGHOURS,
      [OpeninghoursTable.ID,
      OpeninghoursTable.DAY,
      OpeninghoursTable.CLOSETIME,
      OpeninghoursTable.OPENTIME], `${OpeninghoursTable.SID} = ?`, [id]);
      if (result.length >= 0) {
        return result;
      } else {
        return false;
      }
  }
  public async isReviewStore(uid,sid) {
    return await mysql.first(
      Tables.STOREREVIEW,
      [StorereviewTable.ID,StorereviewTable.RATING,StorereviewTable.TITLE,StorereviewTable.DESCRIPTION],
      `${StorereviewTable.UID} = ?
      AND ${StorereviewTable.SID} = ${sid}`,
      [uid]
    );
  }
}

