import axios from 'axios';

const crypto = require('crypto');

export default class AzGateway {
  private url: string;
  private readonly merchantId = 'azdanaz';
  private readonly currency = 994;
  private readonly secretKey = '123456qwerty';
  constructor (test: boolean) {
    this.url = test ? 'https://test.millikart.az:7444/gateway/payment' : 'https://pay.millikart.az/gateway/payment';
  }

  public createSignature (amount: string, description: string, reference: string) {
    return crypto.createHash('md5').update(`Mid = ${this.merchantId}; amount = ${amount}; currency = ${this.currency}; description = ${description}; reference = ${reference}; language = az; Secret key = ${this.secretKey}`).digest('hex').toUpperCase();
  }

  private createTokenLink (amount: string, description: string, reference: string) {
    return `${this.url}/register?mid=${this.merchantId}&amount=${amount}&currency=${this.currency}&description=${description}&reference=${reference}&language=az&signature=${this.createSignature(amount, description, reference)}&redirect=0`;
  }

  private createCheckStatusLink (reference: string) {
    return `${this.url}/status?mid=${this.merchantId}&reference=${reference}`;
  }

  public generateToken (amount: string, reference: string) {
    return axios.post(this.createTokenLink(amount, `Pay${amount}`, reference));
  }

  public verifyTransaction (reference: string) {
    return axios.post(this.createCheckStatusLink(reference));
  }
}
