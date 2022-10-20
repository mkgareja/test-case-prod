import * as Enum from 'enum';
import { Tables } from '../config/tables';

export class Constants {
  public static readonly CRASH_EMAIL = 'vvpmahesh@gmail.com';
  public static readonly REVIEW_RETURN_LIMIT = 10;
  public static readonly EMAIL_TEXT ='iXopp Support';
  public static readonly LIMIT = 10;
  public static readonly CURRENCY = '$';
  public static readonly RADIUS_ARRAY = [10,15,20];
  public static readonly STORE_STATUS_OPEN = 'Open now';
  public static readonly STORE_STATUS_CLOSE = 'Close now';
  public static readonly STORE_STATUS_DEFAULT = '';
  public static readonly TIME_FORMATE_STORE = 'h:mm a';
  public static readonly TIME_FORMATE_STORE_OPEN_CLOSE = 'hh:mm:ss';
  public static readonly TIMEZONE = 'Asia/Kolkata';
  public static readonly TIMEZONE_EST = 'America/New_York';
  public static readonly MOMENT_DAY = 'dddd';
  public static readonly SUCCESS = 'SUCCESS';
  public static readonly ERROR = 'ERROR';
  public static readonly BAD_DATA = 'BAD_DATA';
  public static readonly CODE = 'CODE';
  public static readonly DATA_BASE_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  public static readonly DATA_BASE_DATE_FORMAT = 'YYYY-MM-DD';
  public static readonly DATE_REVIEW_FORMAT = 'MMMM DD, YYYY';
  public static readonly DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';
  public static readonly DATE_FORMAT = 'DD/MM/YYYY';
  public static readonly TIME_HOUR_MINUTE_FORMAT = 'HH:mm';
  public static readonly TIME_HOUR_FORMAT = 'HH';
  public static readonly TIME_MIN_FORMAT = 'mm';
  public static readonly TIME_HOUR_FORMAT_12 = 'hh:mm A';

  public static readonly UNAUTHORIZED_CODE = 401;
  public static readonly FORBIDDEN_CODE= 403;
  public static readonly NOT_FOUND_CODE = 404;
  public static readonly PRECONDITION_FAILED = 412;
  public static readonly SUCCESS_CODE = 200;
  public static readonly INTERNAL_SERVER_ERROR_CODE = 500;
  public static readonly FAIL_CODE = 400;
  public static readonly RANDOM_CODE_STR_LENGTH = 6;
  public static readonly EXPIRY_MINUTES = 5;
  public static readonly HASH_STRING_LIMIT = 12;
  public static readonly MASTER_OTP = '123456';
  public static readonly DISTANCE = 1000000;
  public static readonly TIME_ZONE = 530;

  public static readonly OTP_SMS_POSTFIX = 'is your OTP to Login to OTOLink.';
  public static readonly LOCALTEXT_SENDER_NAME = 'OTLNK';
  public static readonly OTP_EXPIRE_LIMIT = 5;
  public static readonly DEFAULT_LIMIT = 10;
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DAY_FIRST_HALF_START_TIME = 10;
  public static readonly DAY_FIRST_HALF_END_TIME = 13;
  public static readonly DAY_SECOND_HALF_START_TIME = 14;
  public static readonly DAY_SECOND_HALF_END_TIME = 19;
  public static readonly TIME_INTERVAL = 45;
  public static readonly TIME_SLOT_INTERVAL = 30;
  public static readonly EMAIL_EXPIRE_LIMIT = 24;
  public static readonly FILE_SIZE = 15;
  public static readonly DEFAULT_COUNTRY_CODE = '+961';
  public static readonly NOTIFICATION_SOUND = "Default";

  public static readonly EMAIL_REDIRECTION_LINK = 'auth/verify-email';
  public static readonly MEDIA_THUMB_TYPE = 'GENERAL';

  public static readonly PAGINATION_PAGE_NUM = 0;
  public static readonly PAGINATION_PAGE_SIZE = 50;
  public static readonly PAGTNATION_MAX_PAGE_SIZE = 1844674407370955161;

  public static readonly DAYS = new Enum({
    'weekdays': 'weekdays',
    'saturday': 'saturday',
    'sunday': 'sunday'
  });

  public static readonly PAGES = new Enum({
    LOGIN : 'login',
    SIGN_UP : 'sign up',
    FORGOT_PASSWORD : 'forgot password',
    CHANGE_PASSWORD : 'change password',
    RESET_PASSWORD : 'reset password',
    HOME : 'home',
    SEARCH : 'search',
    PODUCT_DETAIL : 'poduct detail',
    STORE_DETAIL : 'store detail',
    RATING : 'rating',
    STORE_LIST : 'store list',
    EDIT_PROFILE : 'edit profile',
    TERMS_AND_CONDITION : 'terms and condition',
    PRIVACY_POLICY: 'privacy policy',
  });

  public static readonly DEVICE_TYPE = {
    IOS: 'iOS',
    ANDROID: 'android',
  };

  public static readonly TEST_DRIVE_TYPE = new Enum({ dealer: 'atDealer', home: 'atHome' });

  public static readonly LANGUAGES = new Enum({ en: 1, ar: 2 });

  public static readonly CONTENT_TYPE = new Enum({ about: 1, policy: 2, terms: 3 });

  public static readonly INQUIRY_TYPE = new Enum({
    'General Inquiry': 3,
    'Sales Inquiry': 4,
    'Service Inquiry': 5,
    'Billing Inquiry': 6,
  });

  public static readonly SES_API_VERSION = '2010-12-01';

  public static readonly MASTER_TABLES = {
    [Tables.HOBBIES]: {},
    [Tables.MODULE]: {
      isEnable: true,
      isStaff: true,
    },
    [Tables.SUBMODULE]: {},
    [Tables.DESIGNATION]: {},
    [Tables.HOLIDAYS]: {},
    [Tables.OCCUPATIONS]: {},
  };

  public static readonly MODULE_IDS = [3, 4];

  public static readonly CDK_URLS = {
    REQUEST_TOKEN: '/ServiceOnline/RequestToken',
    CHECK_PASSWORD: '/ServiceOnline/CheckPassword',
    CHASIS_PRE_POPULATION: '/ServiceOnline/ChassisPrePopulation',
    GET_MAKE_MODEL_VARIANT: '/ServiceOnline/GetMakeModelVariant',
    GET_RECOMMENDED_SERVICE: '/ServiceOnline/GetRecommendedService',
    GET_APPOINTMENT_DATES: '/ServiceOnline/GetAppointmentDates',
    GET_APPOINTMENT_TIME: '/ServiceOnline/GetAppOptionsAndTime',
    ADD_APPOINTMENT: '/ServiceOnline/AddAppointment',
    GET_SERVICE_ADVISORS: '/ServiceOnline/GetServiceAdvisors',
    UPDATE_APPOINTMENT: '/ServiceOnline/UpdateAppointment',
    CONFIRM_APPOINTMENT: '/ServiceOnline/ConfirmAppointment',
    DELETE_APPOINTMENT: '/ServiceOnline/DeleteCustomerAppointment',
    ACTIVE_TOKEN: '/ServiceOnline/ActivateToken',
    REGISTER_CUSTOMER: '/ServiceOnline/RegisterCustomer',
    ADD_CUSTOMER_VEHICLE: '/ServiceOnline/AddCustomerVehicle',
    DELETE_CUSTOMER_VEHICLE: '/ServiceOnline/DeleteCustomerVehicle'
  };
  public static readonly ANIMATED_SPECIFICATIONS = [
    'Top Speed (KM)',
    'Horse Power',
    'Cubic Capacity',
  ];

  public static readonly PAYMENT_ORDER_TYPE = ['service', 'vehicleDeposite', 'makePayment'];

  public static readonly PAYMENT_TYPE = ['cod', 'creditCard'];

  public static readonly VEHICLE_DOWN_PAYMENT_TYPES = ['cod', 'prePaid'];

  public static readonly PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    PROCESSING: 'processing',
    FAILED: 'failed',
  };

  public static readonly NOTIFICATION_TYPES = {
    PUSH: 'push',
    EMAIL: 'email',
    BOTH: 'both',
  };

  public static readonly DEALERSHIP_LOCATION_TYPES = ['showroom', 'workshop', 'partsCenter'];

  public static readonly AREEBA_URLS = {
    CREATE_SESSION: '/session',
    RETRIVE_ORDER: '/order',
    TOKENIZATION: '/token',
    PAY_WITH_TOKEN: '/transaction',
  };

  public static readonly API_METHOD = {
    POST: 'POST',
    GET: 'GET'
  };

  public static readonly environments = {
    DEVELOPMENT: 'development',
    STAGE: 'stage',
    PRODUCTION: 'production'
  }
}
