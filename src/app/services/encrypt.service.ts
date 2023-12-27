import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class EncryptService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) { }

  getDecryptedToken(): string | null {
    const encryptedToken = localStorage.getItem('tk');
    if (encryptedToken) {
      const decryptedToken = AES.decrypt(
        encryptedToken,
        'Banasan2023*'
      ).toString(enc.Utf8);
      return decryptedToken || null;
    }
    return null;
  }

  getDecryptedEmail(): string | null {
    const encryptedEmail = localStorage.getItem('correo');
    if (encryptedEmail) {
      const decryptedEmail = AES.decrypt(
        encryptedEmail,
        'Banasan2023*'
      ).toString(enc.Utf8);
      return decryptedEmail || null;
    }
    return null;
  }
}
