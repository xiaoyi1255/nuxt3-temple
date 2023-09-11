import { LocalStorage } from './cache';

class TokenService {

  get token(){
    return LocalStorage.getItem<string>('token');
  }
  get refreshToken() {
    return LocalStorage.getItem<string>('refreshToken');
  }
  // 存储 Token
  setToken(token: string) {
    LocalStorage.setItem('token', token);
  }

  // 存储 Refresh Token
  setRefreshToken(refreshToken: string) {
    LocalStorage.setItem('refreshToken', refreshToken);
  }

  // 删除 Token
  removeToken() {
    LocalStorage.removeItem('token');
  }

  // 删除 Refresh Token
  removeRefreshToken() {
    LocalStorage.removeItem('refreshToken');
  }
}

const tokenService = new TokenService();

export {
  tokenService
};
