"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Star, User, MapPin, Briefcase, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useAuth, useRemoveFavorite } from "@/lib/api/useApi";
import Image from "next/image";

export default function UserFavoritesPage() {
    const { user: currentUser } = useAuth();
    const removeFavorite = useRemoveFavorite();

    const handleRemoveFavorite = (favoriteId: string) => {
        if (currentUser) {
            removeFavorite.mutate({
                userId: currentUser.id,
                favoriteId
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">وکیل‌های نشان شده</h1>
                <div className="text-sm text-gray-600">
                    {currentUser?.favorites?.length || 0} وکیل
                </div>
            </div>

            {currentUser?.favorites && currentUser.favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentUser.favorites.map((favorite) => (
                        <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-48 bg-gradient-to-r from-[#ca2a30] to-[#b02529]">
                                <div className="absolute inset-0 bg-black opacity-20"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                    <div className="text-white">
                                        <div className="text-lg font-bold">{favorite.lawyerName}</div>
                                        <div className="text-sm opacity-90">{favorite.lawyerSpecialty}</div>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span>4.8</span>
                                        <span>•</span>
                                        <span>5 سال سابقه</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>تهران</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{favorite.lawyerSpecialty}</span>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Link href={`/app/lawyers/${favorite.lawyerId}`} className="flex-1">
                                            <Button size="sm" className="w-full bg-[#ca2a30] hover:bg-[#b02529]">
                                                مشاهده پروفایل
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveFavorite(favorite.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Star className="w-4 h-4 fill-current" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ وکیلی نشان نشده</h3>
                        <p className="text-gray-500 mb-6">شما هنوز وکیلی را به علاقه‌مندی‌های خود اضافه نکرده‌اید.</p>
                        <Link href="/app/lawyers">
                            <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                مشاهده وکلا
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}