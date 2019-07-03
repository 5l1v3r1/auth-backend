let config = {
  host: 'http://127.0.0.1',
  port: 3001,
  mongodb_url: 'mongodb://127.0.0.1:27017/wilbi',
  email_smtp_user: '',
  email_smtp_password: '',
  jwt_secret: 'secret',
  email_verification_secret: 'secret',
  access_token_ttl: 60 * 24

}

export default config;
