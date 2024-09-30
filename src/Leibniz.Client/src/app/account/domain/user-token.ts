export interface UserToken {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}
