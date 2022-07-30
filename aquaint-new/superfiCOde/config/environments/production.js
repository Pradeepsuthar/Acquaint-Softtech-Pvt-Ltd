module.exports = {
  PORT: 4000,
  NAME: "super_fi_node_production",
  DB_HOST: "localhost",
  DB_USERNAME: "aquaint",
  DB_PASSWORD: "",
  DB_NAME: "super_fi_stage",
  DB_PORT: "5432",
  SALT_ROUNDS: 2,
  SECRET: "SuperFi@aNr4eT27NxRP3Qa4mU",
  ADMIN_SECRET: "SuperFiAdmin@17wkdsh0ESfZimvJvQ",
  UPLOAD_DIR: "./uploads/",
  JWT_EXPIRATION: 60 * 60 * 24 * 7,
  DATA_LIMIT: 10,
  DOMAIN: "http://apistage.upped.com",
  getServerUrl(req) {
    var SERVER_URL = "http://apistage.joinsuperfi.com";
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
	TRUELAYER_AUTH_LINK: 'https://auth.truelayer-sandbox.com/?response_type=code&client_id=<client_id>&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access&redirect_uri=<redirect_uri>&provider_id=<provider_id>'
};
