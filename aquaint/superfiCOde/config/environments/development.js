module.exports = {
  PORT: 4000,
  NAME: "super_fi_node_stage",
  MOBILE_API_KEY: "3SATbuIEVJmmM9XPgO3uHKcQwSZtvkk",
  DB_HOST: "159.223.104.12",
  DB_USERNAME: "postgres",
  DB_PASSWORD: "45ukMOWkjKhGlk5Jx7",
  DB_NAME: "superfi_stage",
  DB_PORT: "5432",
  SALT_ROUNDS: 2,
  SECRET: "SuperFi@aNr4eT27NxRP3",
  ADMIN_SECRET: "SuperFiAdmin@17wkdsh0ESfZi",
  UPLOAD_DIR: "./uploads/",
  JWT_EXPIRATION: 60 * 60 * 24 * 7,
  DATA_LIMIT: 10,
  DOMAIN: "http://superfi.acquaintsoft.com:4000",
  ADMIN_URL: "http://superfi.acquaintsoft.com",
  APP_DEEPLINK_SCHEMA: "superfi://",
  getServerUrl(req) {
    var SERVER_URL = "http://superfi.acquaintsoft.com";
    return SERVER_URL;
  },
  SMTP_SENDER_EMAIL: `"SuperFi Support" <support@joinsuperfi.com>`,
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "465",
  SMTP_USERNAME: "support@joinsuperfi.com",
  SMTP_PASSWORD: "M%7bWAhM",
  TRUELAYER_CLIENT_ID: 'sandbox-superfi-1ddcac',
	TRUELAYER_SECRET_KEY: '8e5536de-4910-4e22-9c89-9fc5aad4df1a',
	TRUELAYER_REDIRECT_URI: 'https://console.truelayer.com/redirect-page',
  TRUELAYER_SANDBOX_AUTH_BASE_URL: 'https://auth.truelayer-sandbox.com',
  TRUELAYER_SANDBOX_API_BASE_URL: 'https://api.truelayer-sandbox.com'
};
