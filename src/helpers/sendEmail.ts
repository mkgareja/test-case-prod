import * as fs from "fs";
import { keys } from "lodash";
import * as nodemailer from "nodemailer";
import * as path from "path";
import { Constants } from "../config/constants";
import { Log } from "./logger";
import * as dotenv from 'dotenv';
dotenv.config();

export class SendEmail {

    public static sendRawMail = (
        template: string = null, replaceData: Json = null, email: string[], subject: string, text: string = Constants.EMAIL_TEXT,
    ) => {

        let html = "";
        if (template) {
            // send email for verification
            const templatesDir = path.resolve(`${__dirname}/../../src/`, "templates");
            const content = `${templatesDir}/${template}.html`;
            html = SendEmail.getHtmlContent(content, replaceData);
        }

        const mailOptions = {
            from: `Oyetest <${process.env.DEFAULT_FROM}>`,
            html,
            replyTo: process.env.DEFAULT_REPLY_TO,
            subject,
            to: email,
            text,
        };


        let transportObj;
        if (process.env.ENV === Constants.environments.DEVELOPMENT) {
            // transportObj = nodemailer.createTransport({
            //     host: process.env.AWS_SMTP_HOST,
            //     port: process.env.AWS_SMTP_PORT,
            //     auth: {
            //         user: process.env.ACCESS_KEY,
            //         pass: process.env.SECRET_KEY,
            //     }
            // })
             transportObj = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                  user: 'apikey',
                  pass: process.env.SENDGRID_KEY
                }
              });
        } else {
            // transportObj = nodemailer.createTransport({
            //     host: process.env.AWS_SMTP_HOST,
            //     port: process.env.AWS_SMTP_PORT,
            //     auth: {
            //         user: process.env.ACCESS_KEY,
            //         pass: process.env.SECRET_KEY,
            //     }
            // })
                transportObj = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_KEY
                }
              });
        }


        transportObj.sendMail(mailOptions, (mailSendErr: any, info: any) => {
            if (!mailSendErr) {
                SendEmail.logger.info(`Message sent: ${info.response}`);
            } else {
                SendEmail.logger.error(`Error in sending email: ${mailSendErr} and info ${info}`);
            }
        });
    }

    private static logger: any = Log.getLogger();

    // Just reading html file and then returns in string
    public static getHtmlContent = (filePath: string, replaceData: any) => {
        const data = fs.readFileSync(filePath);
        let html = data.toString();
        keys(replaceData).forEach((key) => {
            html = html.replace(key, replaceData[key]);
        });
        return html;
    }
}
