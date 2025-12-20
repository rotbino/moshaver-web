import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/radix/button';
import { Card, CardContent } from '@/components/radix/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/radix/alert-dialog';
import { Download, Trash2, Play, Pause, Loader2 } from 'lucide-react';
import { useFile } from '@/lib/hooks/useFile';
import { encodeBase64 } from '@/lib/utils/utils';

interface VideoPreviewProps {
    fileId: number | null;
    onDelete: () => void;
}

export function VideoPreview({ fileId, onDelete }: VideoPreviewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: number; uploadDate: string } | null>(null);
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

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (isFetchingFile) {
        return (
            <Card className="flex items-center justify-center h-64">
                <CardContent className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">در حال بارگذاری ویدیو...</p>
                </CardContent>
            </Card>
        );
    }

    if (error || !previewUrl || !fileInfo) {
        return (
            <Card className="flex items-center justify-center h-64 border border-destructive">
                <CardContent className="flex flex-col items-center justify-center text-center p-4">
                    <p className="text-destructive font-medium">خطا در بارگذاری ویدیو</p>
                    <p className="text-sm text-muted-foreground mt-1">{error || 'فایل یافت نشد'}</p>
                </CardContent>
            </Card>
        );
    }

    const formattedSize = (fileInfo.size / 1024 / 1024).toFixed(2) + ' MB';
    const formattedDate = new Date(fileInfo.uploadDate).toLocaleDateString();

    return (
        <Card className="group relative overflow-hidden border dark:border-gray-700">
            <CardContent className="p-0">
                <div className="relative aspect-video w-full">
                    <video
                        ref={videoRef}
                        src={previewUrl}
                        className="h-full w-full object-cover"
                        onClick={togglePlay}
                    />

                    {/* Play/Pause Overlay */}
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={togglePlay}
                    >
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-12 w-12 rounded-full"
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6" />
                            ) : (
                                <Play className="h-6 w-6" />
                            )}
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleDownload}
                            className="h-8 w-8 p-0"
                        >
                            <Download className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 w-8 p-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>حذف ویدیو</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        آیا از حذف این ویدیو مطمئن هستید؟ این عمل غیرقابل بازگشت است.
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

                {/* File Info */}
                <div className="p-3">
                    <p className="truncate text-sm font-medium">{fileInfo.name}</p>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{formattedSize}</span>
                        <span>{formattedDate}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}