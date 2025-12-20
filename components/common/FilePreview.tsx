import React, { useState, useEffect } from 'react';
import { Button } from '@/components/radix/button';
import { Card, CardContent } from '@/components/radix/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/radix/alert-dialog';
import { Download, Trash2, FileText, FileImage, FileVideo, File, Loader2 } from 'lucide-react';
import { useFile } from '@/lib/hooks/useFile';
import { encodeBase64 } from '@/lib/utils/utils';

interface FilePreviewProps {
    fileId: number | null;
    onDelete: () => void;
}

export function FilePreview({ fileId, onDelete }: FilePreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; type: string; size: number; uploadDate: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { fetchFile, isFetchingFile } = useFile();

    useEffect(() => {
        const fetchFromServer = async () => {
            if (!fileId) {
                setPreviewUrl(null);
                setFileInfo(null);
                setError(null);
                return;
            }

            try {
                const file = await fetchFile(fileId, 1);
                if (file?.content) {
                    const blobUrl = encodeBase64(file.content);
                    setPreviewUrl(blobUrl);
                    setFileInfo({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        uploadDate: file.uploadDate
                    });
                    setError(null);
                } else {
                    setError("محتوای فایل یافت نشد");
                }
            } catch (err) {
                console.error("❌ Error fetching file:", err);
                setError("خطا در بارگذاری فایل");
            }
        };

        fetchFromServer();
    }, [fileId, fetchFile]);

    const handleDownload = () => {
        if (!previewUrl || !fileInfo) return;

        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = fileInfo.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileIcon = () => {
        if (!fileInfo) return <File className="h-10 w-10 text-gray-500" />;

        if (fileInfo.type.startsWith('image/')) return <FileImage className="h-10 w-10 text-blue-500" />;
        if (fileInfo.type.startsWith('video/')) return <FileVideo className="h-10 w-10 text-green-500" />;
        if (fileInfo.type.includes('pdf')) return <FileText className="h-10 w-10 text-red-500" />;
        return <File className="h-10 w-10 text-gray-500" />;
    };

    if (isFetchingFile) {
        return (
            <Card className="flex items-center justify-center h-64">
                <CardContent className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">در حال بارگذاری فایل...</p>
                </CardContent>
            </Card>
        );
    }

    if (error || !fileInfo) {
        return (
            <Card className="flex items-center justify-center h-64 border border-destructive">
                <CardContent className="flex flex-col items-center justify-center text-center p-4">
                    <p className="text-destructive font-medium">خطا در بارگذاری فایل</p>
                    <p className="text-sm text-muted-foreground mt-1">{error || 'فایل یافت نشد'}</p>
                </CardContent>
            </Card>
        );
    }

    const formattedSize = (fileInfo.size / 1024).toFixed(2) + ' KB';
    const formattedDate = new Date(fileInfo.uploadDate).toLocaleDateString();

    return (
        <Card className="group relative overflow-hidden border dark:border-gray-700">
            <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center space-y-3">
                    {getFileIcon()}

                    <div className="text-center">
                        <p className="truncate text-sm font-medium">{fileInfo.name}</p>
                        <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formattedSize}</span>
                            <span>{formattedDate}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownload}
                            className="h-8"
                        >
                            <Download className="mr-1 h-4 w-4" />
                            دانلود
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8"
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    حذف
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>حذف فایل</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        آیا از حذف این فایل مطمئن هستید؟ این عمل غیرقابل بازگشت است.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>حذف</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}