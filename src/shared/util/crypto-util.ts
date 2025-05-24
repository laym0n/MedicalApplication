import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

export function encryptWithKey(data: string, encryptionKey: string) {
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

export function decryptWithKey(data: string, encryptionKey: string) {
    return CryptoJS.AES.decrypt(data, encryptionKey).toString(CryptoJS.enc.Utf8);
}

export function generateKey() {
    return CryptoJS.lib.WordArray.random(32).toString();
}
