// lib/api/file.ts

import { DtoIn_getFile, DtoOut_File, DtoIn_File, DtoOut_putFile } from "@/lib/types/file";
import {apiRequest} from "@/lib/api/apiRequest";

export const fileApi = {
    // ----- دریافت فایل -----
    getFile: async (data: DtoIn_getFile): Promise<DtoOut_File> => {
        return apiRequest("/getFile", {
            method: "POST",
            data,
        });
    },

    // ----- آپلود فایل -----
    putFile: async (data: DtoIn_File): Promise<DtoOut_putFile> => {
        return apiRequest("/putFile", {
            method: "POST",
            data,
        });
    },
};
