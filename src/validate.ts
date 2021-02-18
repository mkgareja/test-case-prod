import { Model } from "./model";
import * as l10n from "jm-ez-l10n";
import { Constants } from "./config/constants";
const { validationResult } = require('express-validator/check');
l10n.setTranslationsFile("en", `src/language/translation.en.json`);

export class Validator {
  public validate(arg: Model) {
    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
    return function (req, res, next) {
      Model.getModel(arg, req.body, req.query).then((m2) => {
        req.model = m2;
        next();
      }).catch((err) => {
        // Refactor validation messages
        const error = err.length > 0 && err[0].constraints ?
          err[0].constraints[`${Object.keys(err[0].constraints)[0]}`] : err;
        const errMessage = req.t(error).length > 0 ? req.t(error) : error;
        return res.status(Constants.FAIL_CODE).json({ error: errMessage, code: Constants.FAIL_CODE });
      });
    };
  }

  public fileValidate(arg: Model) {
    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
    return function (req, res, next) {
      Model.getModel(arg, req.files, req.query).then((m2) => {
        req.model = m2;
        next();
      }).catch((err) => {
        // Refactor validation messages
        const error = err.length > 0 && err[0].constraints ?
          err[0].constraints[`${Object.keys(err[0].constraints)[0]}`] : err;
        const errMessage = req.t(error).length > 0 ? req.t(error) : error;
        return res.status(Constants.FAIL_CODE).json({ error: errMessage, code: Constants.FAIL_CODE });
      });
    };
  }

  public validationHandler(req, res, next) {
    const myValidationResult = validationResult.withDefaults({
      formatter: (error) => {
        return error.param + req.t(error.msg.key, error.msg.fields);
      },
    });
    const result = myValidationResult(req);
    if (!result.isEmpty()) {
      return res.status(404).json({
        message: result.array().join(' and '),
      });
    }
    return next();
  }
}