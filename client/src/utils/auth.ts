import { LocalStorage } from './cache';

interface UserInfo {
  uid: number
  did?: string
  gender?: string
  usename: string
}
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

class UserInfoService {

  get userInfo(){
    return LocalStorage.getItem<string>('userInfo');
  }

  setUserInfo(userInfo: UserInfo) {
    LocalStorage.setItem('userInfo', JSON.stringify(userInfo));
  }

}

const tokenService = new TokenService();
const userInfoService = new UserInfoService()

export {
  tokenService,
  userInfoService,
};
