"use client";

import { useState } from "react";
import { DtoIn_File, DtoIn_getFile } from "@/lib/api/types";
import { useMutation } from "@tanstack/react-query";
import {fileApi} from "@/lib/api/fileApi";
import jMoment from "moment-jalaali";
import {decodeBase64, generateMyMac, increaseStringSize} from "@/lib/utils/utils";

export const useFile = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    // ----- Get File -----
    const getFileMutation = useMutation({
        mutationFn: (fileId: number, version: number ) => {
            const clientTime = jMoment().format("YYYY-MM-DD HH:mm:ss");

            if(!version){
                version="";
            }
            const str = clientTime +
                increaseStringSize(fileId, 12," ",false)
                +increaseStringSize(version, 5," ",false)

            const mac = generateMyMac(str);
            const input={
                file: { id: fileId },
                clientTime,
                mac,
                transType: "S",
            }
            return  fileApi.getFile(input)
        },
    });

    // ----- Put File (Upload) -----
    const putFileMutation = useMutation({
        mutationFn: (data: DtoIn_File) => {
            const fileType = data.fileType || "S";
            const name = data.name;
            const clientTime = jMoment().format('YYYY-MM-DD HH:mm:ss');
            const content = decodeBase64(data.result);
            const contentLength = data.result.length.toString();
            const str = clientTime +
                increaseStringSize(fileType, 8," ",false) +
                increaseStringSize(name, 16," ",false) +
                increaseStringSize(contentLength, 8," ",false)

            const mac = generateMyMac(str);

            const input = {
                type: fileType,
                name,
                content,
                status: "U",
                transType: "S",
                clientTime,
                mac,
            }

            return fileApi.putFile(input, {
                onUploadProgress: (progressEvent: ProgressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percent);
                },
            })
        },
        onMutate: () => {
            setUploading(true);
            setUploadProgress(0);
        },
        onSuccess: () => {
            setUploading(false);
        },
        onError: () => {
            setUploading(false);
            setUploadProgress(0);
        },
    });

    return {
        uploadProgress,
        uploading,
        isUploadingFile: uploading,
        fetchFile: getFileMutation.mutateAsync,
        uploadFile: putFileMutation.mutateAsync,
        isFetchingFile: getFileMutation.isPending,
    };
};