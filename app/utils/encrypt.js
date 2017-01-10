import CryptoJS from 'crypto-js';

export function encrypt(input) {
  if (input.length > 40 && input.endsWith('=')) {
    return input;
  }

  return CryptoJS.AES.encrypt(input, '<]-88KaT=QRGN+Z7z45Sfmf,Jjsd`L[tg$7ZQLP$e+(7""K%=').toString();
}

export function decrypt(input) {
  const bytes = CryptoJS.AES.decrypt(input, '<]-88KaT=QRGN+Z7z45Sfmf,Jjsd`L[tg$7ZQLP$e+(7""K%=');
  return bytes.toString(CryptoJS.enc.Utf8);
}
