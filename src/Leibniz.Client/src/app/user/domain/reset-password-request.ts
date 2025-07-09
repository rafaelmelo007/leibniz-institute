export interface ResetPasswordRequest {
  changePasswordToken: string;
  newPassword: string;
  confirmNewPassword: string;
}
