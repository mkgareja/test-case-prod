import * as mysql from 'jm-ez-mysql';
import { Tables, CategoryTable, AttachmentTable, AttachmentThumbTable } from '../../config/tables';
import { ResponseBuilder } from '../../helpers/responseBuilder';

export class CategoryUtils {
  public async getCategory() {
    const result = await mysql.findAll(`
      ${Tables.CATEGORY} c
      LEFT JOIN ${Tables.ATTACHMENT} att ON att.${AttachmentTable.ID} = c.${CategoryTable.ATTACHMENTID}
      LEFT JOIN ${Tables.ATTACHMENT_THUMB} ath ON ath.${AttachmentThumbTable.ATTACHMENT_ID} = att.${AttachmentTable.ID}`,
      [`c.${CategoryTable.ID},
      c.${CategoryTable.CATEGORY_NAME},
      CONCAT(IF(att.${AttachmentTable.ID} IS NULL AND ath.${AttachmentThumbTable.ATTACHMENT_ID} IS NULL, '',
      JSON_OBJECT(
        'original', att.${AttachmentTable.NAME},
        'thumb', ath.${AttachmentThumbTable.NAME}
      ))) AS image`], `c.${CategoryTable.IS_ENABLE}=1 order by c.${CategoryTable.ORDER}`);
    // return result
    if (result.length > 0) {
      return ResponseBuilder.data({ status: true, data: result });
    } else {
      return ResponseBuilder.data({ status: false });
    }
  }
}
