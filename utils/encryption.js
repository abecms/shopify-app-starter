import crypto from 'crypto'
import dotenv from "dotenv";
dotenv.config();

const { APPKEY } = process.env;

export const encrypt = (text) => {
  var cipher = crypto.createCipher('aes-256-cbc', APPKEY)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

export const decrypt = (text) => {
  var decipher = crypto.createDecipher('aes-256-cbc', APPKEY)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
