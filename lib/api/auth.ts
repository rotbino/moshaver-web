import {
  ChangePasswordReq,
  DtoIn_loginStatic,
  DtoIn_Otp,
  DtoIn_Password,
  DtoOut_Response,
  DtoOut_Session, DtoOut_UserProfile,
  DtoOutLoginStatic,
  RegisterUserReq,
} from "./types"

import {apiRequest, publicApiRequest} from "@/lib/api/apiRequest"

export const authApi = {
  getToken: async (refreshToken: string): Promise<string> => {
    return await publicApiRequest("/getToken", {
      method: "GET",
      headers: {Authorization: `Bearer ${refreshToken}`},
    })
  },

  registerUserReq: async (data: RegisterUserReq): Promise<DtoOut_Session> => {
    return apiRequest("/registerUserReq", {
      method: "POST",
      data,
      needSessionId: false,
    });
  },


  registerUserAut: async (data: DtoIn_Otp): Promise<DtoOut_Response> => {
    return apiRequest("/registerUserAut", {
      method: "POST",
      data,
    })
  },
  resendRegisterToken: async (): Promise<DtoOut_Response> => {
    return apiRequest("/resendRegisterToken", {
      method: "POST",
      data: {},
    });
  },

  registerUserPas: async (data: DtoIn_Password): Promise<DtoOut_Response> => {
    return apiRequest("/registerUserPas", {
      method: "POST",
      data,
    })
  },
  login: async (data: DtoIn_loginStatic): Promise<DtoOutLoginStatic> => {
    return apiRequest("/loginStatic", {
      method: "POST",
      data,
      needSessionId: false,
    });
  },
  logout: async (data: DtoOut_Session): Promise<DtoOutLoginStatic> => {
    return apiRequest("/logout", {
      method: "POST",
      data,
    });
  },

  forgetPassword: async (data: {
    phone: string;
    nationalId: string;
    birthDate: string;
  }): Promise<DtoOut_Response> => {
    return apiRequest("/forgetPassword", {
      method: "POST",
      data,
      needSessionId: false,
    });
  },

  changePassword: async (data: ChangePasswordReq): Promise<DtoOut_Response> => {
    return apiRequest("/forgetPassword", {
      method: "POST",
      data,
    });
  },
  refreshUserProfile: async (data: {}): Promise<DtoOut_UserProfile> => {
    return apiRequest("/refreshUserProfile", {
      method: "POST",
      data,
    });
  },


}
