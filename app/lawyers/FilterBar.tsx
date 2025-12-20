// app/lawyers/FilterBar.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {  useSpecialties, useSkills,  } from '@/lib/data-service/hooks';
import { Button } from '@/components/radix/button';
import { MapPin, Briefcase, Wrench, X, Wifi, Star, Clock } from 'lucide-react';
import {  LawyerSortBy, SortOrder, ConsultationType, ConsultationDuration, Specialty, Skill } from '@/lib/data-transfer/data-types';
import { cn } from '@/lib/utils';
import FilterModal from "@/app/lawyers/FilterModal";
import SortDropdown from "./SortDropdown";
import {LawyersFilter} from "@/lib/data-transfer/types";
import {useProvinces,useCities} from "@/lib/data-transfer/api-hooks";

interface FilterBarProps {
    filters: LawyersFilter;
    onFiltersChange: (filters: LawyersFilter) => void;
    sortBy: LawyerSortBy;
    sortOrder: SortOrder;
    onSortChange: (sortBy: LawyerSortBy) => void;
}

export default function FilterBar({
                                      filters,
                                      onFiltersChange,
                                      sortBy,
                                      sortOrder,
                                      onSortChange
                                  }: FilterBarProps) {
    const { data: provincesData } = useProvinces();
    const { data: specialtiesData } = useSpecialties();
    const { data: skillsData } = useSkills();
    const { data: citiesData } = useCities();

    const [openModal, setOpenModal] = useState<string | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string>(filters.province || '');
    const [selectedCities, setSelectedCities] = useState<string[]>(Array.isArray(filters.city) ? filters.city : (filters.city ? [filters.city] : []));
    const [selectedCityFilter, setSelectedCityFilter] = useState<string[]>(Array.isArray(filters.cities) ? filters.cities : (filters.cities ? [filters.cities] : []));
    const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>(filters.specialties || []); // تغییر از 'specialty' به 'specialties'
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>(filters.skills || []);
    const [onlineOnly, setOnlineOnly] = useState<boolean>(filters.onlineOnly || false);
    const [includeVIP, setIncludeVIP] = useState<boolean>(filters.includeVIP || false);
    const [selectedConsultationType, setSelectedConsultationType] = useState<ConsultationType | null>(filters.consultationType || null);
    const [consultationDuration, setConsultationDuration] = useState<ConsultationDuration | null>(filters.duration || null);

    // حالت چند انتخابی برای هر فیلتر
    const [isSpecialtyMultiSelect, setIsSpecialtyMultiSelect] = useState(false);
    const [isSkillMultiSelect, setIsSkillMultiSelect] = useState(false);
    const [isCityMultiSelect, setIsCityMultiSelect] = useState(false);
    const [isCityFilterMultiSelect, setIsCityFilterMultiSelect] = useState(false);

    // مقادیر موقت برای حالت چند انتخابی
    const [tempSpecialties, setTempSpecialties] = useState<Specialty[]>([]);
    const [tempSkills, setTempSkills] = useState<Skill[]>([]);
    const [tempCities, setTempCities] = useState<string[]>([]);
    const [tempCityFilter, setTempCityFilter] = useState<string[]>([]);

    // همگام‌سازی state با props
    useEffect(() => {
        setSelectedProvince(filters.province || '');
        setSelectedCities(Array.isArray(filters.city) ? filters.city : (filters.city ? [filters.city] : []));
        setSelectedCityFilter(Array.isArray(filters.cities) ? filters.cities : (filters.cities ? [filters.cities] : []));
        setSelectedSpecialties(filters.specialties || []); // تغییر از 'specialty' به 'specialties'
        setSelectedSkills(filters.skills || []);
        setOnlineOnly(filters.onlineOnly || false);
        setIncludeVIP(filters.includeVIP || false);
        setSelectedConsultationType(filters.consultationType);
        setConsultationDuration(filters.duration);

        // به‌روزرسانی مقادیر موقت در حالت چند انتخابی
        if (isSpecialtyMultiSelect) {
            setTempSpecialties(filters.specialties || []); // تغییر از 'specialty' به 'specialties'
        }
        if (isSkillMultiSelect) {
            setTempSkills(filters.skills || []);
        }
        if (isCityMultiSelect) {
            setTempCities(Array.isArray(filters.city) ? filters.city : (filters.city ? [filters.city] : []));
        }
        if (isCityFilterMultiSelect) {
            setTempCityFilter(Array.isArray(filters.cities) ? filters.cities : (filters.cities ? [filters.cities] : []));
        }
    }, [filters, isSpecialtyMultiSelect, isSkillMultiSelect, isCityMultiSelect, isCityFilterMultiSelect]);


    // اعمال مقادیر چند انتخابی شهر (فیلتر جداگانه)
    const applyMultiSelectCityFilter = useCallback(() => {
        if (tempCityFilter.length < 1) {
            alert('حداقل یک شهر باید انتخاب کنید');
            return;
        }
        setSelectedCityFilter([...tempCityFilter]);
        setTempCityFilter([]);

        // به‌روزرسانی فیلترها و بستن مدال
        const newFilters = {
            ...filters,
            cities: tempCityFilter.length > 0 ? tempCityFilter : undefined
        };
        onFiltersChange(newFilters);
        setOpenModal(null);
    }, [tempCityFilter, filters, onFiltersChange]);

    // مدیریت حذف شهر از لیست انتخاب شده‌ها (فیلتر جداگانه)
    const handleRemoveCityFilter = useCallback((cityName: string) => {
        const newTempCityFilter = tempCityFilter.filter(city => city !== cityName);

        // اگر در حالت چند انتخابی هستیم، فقط مقادیر موقت را آپدیت می‌کنیم
        if (isCityFilterMultiSelect) {
            setTempCityFilter(newTempCityFilter);
            return;
        }

        // در حالت تک انتخابی، مقادیر اصلی را آپدیت می‌کنیم
        const newCities = selectedCityFilter.filter(city => city !== cityName);
        setSelectedCityFilter(newCities);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            cities: newCities.length > 0 ? newCities : undefined
        };
        onFiltersChange(newFilters);
    }, [tempCityFilter, isCityFilterMultiSelect, selectedCityFilter, filters, onFiltersChange]);



    // مدیریت انتخاب تخصص
    const handleSpecialtySelect = useCallback((specialtyName: string, specialtyId: string) => {
        if (isSpecialtyMultiSelect) {
            // در حالت چند انتخابی، فقط در مقادیر موقت ذخیره می‌کنیم
            setTempSpecialties(prev => {
                if (prev.includes(specialtyId as Specialty)) {
                    return prev.filter(id => id !== specialtyId);
                } else {
                    return [...prev, specialtyId as Specialty];
                }
            });
        } else {
            // در حالت تک انتخابی، مستقیماً اعمال می‌کنیم
            const newSpecialties = selectedSpecialties.includes(specialtyId as Specialty) ? [] : [specialtyId as Specialty];
            setSelectedSpecialties(newSpecialties);

            // به‌روزرسانی فیلترها و بستن مدال
            const newFilters = {
                ...filters,
                specialties: newSpecialties.length > 0 ? newSpecialties : undefined // تغییر از 'specialty' به 'specialties'
            };
            onFiltersChange(newFilters);
            setOpenModal(null);
        }
    }, [isSpecialtyMultiSelect, selectedSpecialties, filters, onFiltersChange]);

    // مدیریت تغییر حالت چند انتخابی تخصص
    const handleSpecialtyMultiSelectToggle = useCallback((enabled: boolean) => {
        setIsSpecialtyMultiSelect(enabled);
        if (!enabled) {
            // وقتی حالت چند انتخابی غیرفعال می‌شود، مقادیر موقت را اعمال می‌کنیم
            if (tempSpecialties.length > 0) {
                setSelectedSpecialties([...tempSpecialties]);

                // به‌روزرسانی فیلترها
                const newFilters = {
                    ...filters,
                    specialties: tempSpecialties.length > 0 ? tempSpecialties : undefined // تغییر از 'specialty' به 'specialties'
                };
                onFiltersChange(newFilters);
            }
            setTempSpecialties([]);
        } else {
            // هنگام فعال‌سازی حالت چند انتخابی، مقادیر فعلی را در موقت ذخیره می‌کنیم
            setTempSpecialties([...selectedSpecialties]);
        }
    }, [tempSpecialties, selectedSpecialties, filters, onFiltersChange]);

    // اعمال مقادیر چند انتخابی تخصص
    const applyMultiSelectSpecialties = useCallback(() => {
        if (tempSpecialties.length < 2) {
            alert('در حالت تخصص همزمان، حداقل دو تخصص باید انتخاب کنید');
            return;
        }
        setSelectedSpecialties([...tempSpecialties]);
        setTempSpecialties([]);

        // به‌روزرسانی فیلترها و بستن مدال
        const newFilters = {
            ...filters,
            specialties: tempSpecialties // تغییر از 'specialty' به 'specialties'
        };
        onFiltersChange(newFilters);
        setOpenModal(null);
    }, [tempSpecialties, filters, onFiltersChange]);

    // مدیریت حذف تخصص از لیست انتخاب شده‌ها
    const handleRemoveSpecialty = useCallback((specialtyId: string) => {
        // در حالت چند انتخابی، ما با نام کار می‌کنیم، نه ID
        const specialtyName = specialtiesData?.find(s => s.id === specialtyId)?.title || specialtyId;

        const newTempSpecialties = tempSpecialties.filter(id => id !== specialtyId);
        setTempSpecialties(newTempSpecialties);

        // اگر در حالت چند انتخابی هستیم، فقط مقادیر موقت را آپدیت می‌کنیم
        if (isSpecialtyMultiSelect) {
            return;
        }

        // در حالت تک انتخابی، مقادیر اصلی را آپدیت می‌کنیم
        const newSpecialties = selectedSpecialties.filter(id => id !== specialtyId);
        setSelectedSpecialties(newSpecialties);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            specialties: newSpecialties.length > 0 ? newSpecialties : undefined // تغییر از 'specialty' به 'specialties'
        };
        onFiltersChange(newFilters);
    }, [tempSpecialties, isSpecialtyMultiSelect, selectedSpecialties, filters, onFiltersChange, specialtiesData]);

    // مدیریت انتخاب شهر (فیلتر جداگانه)
    const handleCityFilterSelect = useCallback((cityName: string, cityId: string) => {
        if (isCityFilterMultiSelect) {
            // در حالت چند انتخابی، فقط در مقادیر موقت ذخیره می‌کنیم
            setTempCityFilter(prev => {
                if (prev.includes(cityName)) {
                    return prev.filter(name => name !== cityName);
                } else {
                    return [...prev, cityName];
                }
            });
        } else {
            // در حالت تک انتخابی، مستقیماً اعمال می‌کنیم
            const newCities = selectedCityFilter.includes(cityName) ? [] : [cityName];
            setSelectedCityFilter(newCities);

            // به‌روزرسانی فیلترها و بستن مدال
            const newFilters = {
                ...filters,
                cities: newCities.length > 0 ? newCities : undefined // استفاده از 'cities' به جای 'city'
            };
            onFiltersChange(newFilters);
            setOpenModal(null);
        }
    }, [isCityFilterMultiSelect, selectedCityFilter, filters, onFiltersChange]);

    // مدیریت تغییر حالت چند انتخابی شهر (فیلتر جداگانه)
    const handleCityFilterMultiSelectToggle = useCallback((enabled: boolean) => {
        setIsCityFilterMultiSelect(enabled);
        if (!enabled) {
            // وقتی حالت چند انتخابی غیرفعال می‌شود، مقادیر موقت را اعمال می‌کنیم
            if (tempCityFilter.length > 0) {
                setSelectedCityFilter([...tempCityFilter]);

                // به‌روزرسانی فیلترها
                const newFilters = {
                    ...filters,
                    cities: tempCityFilter.length > 0 ? tempCityFilter : undefined
                };
                onFiltersChange(newFilters);
            }
            setTempCityFilter([]);
        } else {
            // هنگام فعال‌سازی حالت چند انتخابی، مقادیر فعلی را در موقت ذخیره می‌کنیم
            setTempCityFilter([...selectedCityFilter]);
        }
    }, [tempCityFilter, selectedCityFilter, filters, onFiltersChange]);


    // مدیریت انتخاب مهارت
    const handleSkillSelect = useCallback((skillName: string, skillId: string) => {
        if (isSkillMultiSelect) {
            // در حالت چند انتخابی، فقط در مقادیر موقت ذخیره می‌کنیم
            setTempSkills(prev => {
                if (prev.includes(skillId as Skill)) {
                    return prev.filter(id => id !== skillId);
                } else {
                    return [...prev, skillId as Skill];
                }
            });
        } else {
            // در حالت تک انتخابی، مستقیماً اعمال می‌کنیم
            const newSkills = selectedSkills.includes(skillId as Skill) ? [] : [skillId as Skill];
            setSelectedSkills(newSkills);

            // به‌روزرسانی فیلترها و بستن مدال
            const newFilters = {
                ...filters,
                skills: newSkills.length > 0 ? newSkills : undefined
            };
            onFiltersChange(newFilters);
            setOpenModal(null);
        }
    }, [isSkillMultiSelect, selectedSkills, filters, onFiltersChange]);

    // مدیریت تغییر حالت چند انتخابی مهارت
    const handleSkillMultiSelectToggle = useCallback((enabled: boolean) => {
        setIsSkillMultiSelect(enabled);
        if (!enabled) {
            // وقتی حالت چند انتخابی غیرفعال می‌شود، مقادیر موقت را اعمال می‌کنیم
            if (tempSkills.length > 0) {
                setSelectedSkills([...tempSkills]);

                // به‌روزرسانی فیلترها
                const newFilters = {
                    ...filters,
                    skills: tempSkills.length > 0 ? tempSkills : undefined
                };
                onFiltersChange(newFilters);
            }
            setTempSkills([]);
        } else {
            // هنگام فعال‌سازی حالت چند انتخابی، مقادیر فعلی را در موقت ذخیره می‌کنیم
            setTempSkills([...selectedSkills]);
        }
    }, [tempSkills, selectedSkills, filters, onFiltersChange]);

    // اعمال مقادیر چند انتخابی مهارت
    const applyMultiSelectSkills = useCallback(() => {
        if (tempSkills.length < 2) {
            alert('در حالت مهارت همزمان، حداقل دو مهارت باید انتخاب کنید');
            return;
        }
        setSelectedSkills([...tempSkills]);
        setTempSkills([]);

        // به‌روزرسانی فیلترها و بستن مدال
        const newFilters = {
            ...filters,
            skills: tempSkills
        };
        onFiltersChange(newFilters);
        setOpenModal(null);
    }, [tempSkills, filters, onFiltersChange]);

    // مدیریت حذف مهارت از لیست انتخاب شده‌ها
    const handleRemoveSkill = useCallback((skillId: string) => {
        // در حالت چند انتخابی، ما با نام کار می‌کنیم، نه ID
        const skillName = skillsData?.find(s => s.id === skillId)?.title || skillId;

        const newTempSkills = tempSkills.filter(id => id !== skillId);
        setTempSkills(newTempSkills);

        // اگر در حالت چند انتخابی هستیم، فقط مقادیر موقت را آپدیت می‌کنیم
        if (isSkillMultiSelect) {
            return;
        }

        // در حالت تک انتخابی، مقادیر اصلی را آپدیت می‌کنیم
        const newSkills = selectedSkills.filter(id => id !== skillId);
        setSelectedSkills(newSkills);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            skills: newSkills.length > 0 ? newSkills : undefined
        };
        onFiltersChange(newFilters);
    }, [tempSkills, isSkillMultiSelect, selectedSkills, filters, onFiltersChange, skillsData]);

    // حذف فیلترها
    const removeLocation = () => {
        setSelectedProvince('');
        setSelectedCities([]);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            province: '',
            city: undefined
        };
        onFiltersChange(newFilters);
    };

    const removeCityFilter = () => {
        setSelectedCityFilter([]);
        setIsCityFilterMultiSelect(false);
        setTempCityFilter([]);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            cities: undefined
        };
        onFiltersChange(newFilters);
    };

    const removeSpecialty = () => {
        setSelectedSpecialties([]);
        setIsSpecialtyMultiSelect(false);
        setTempSpecialties([]);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            specialty: undefined
        };
        onFiltersChange(newFilters);
    };

    const removeSkill = () => {
        setSelectedSkills([]);
        setIsSkillMultiSelect(false);
        setTempSkills([]);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            skills: undefined
        };
        onFiltersChange(newFilters);
    };

    const toggleOnlineOnly = () => {
        const newValue = !onlineOnly;
        setOnlineOnly(newValue);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            onlineOnly: newValue
        };
        onFiltersChange(newFilters);
    };

    const toggleIncludeVIP = () => {
        const newValue = !includeVIP;
        setIncludeVIP(newValue);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            includeVIP: newValue
        };
        onFiltersChange(newFilters);
    };

    const removeConsultationType = () => {
        setSelectedConsultationType(null);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            consultationType: undefined
        };
        onFiltersChange(newFilters);
    };

    const removeDuration = () => {
        setConsultationDuration(null);

        // به‌روزرسانی فیلترها
        const newFilters = {
            ...filters,
            duration: undefined
        };
        onFiltersChange(newFilters);
    };

    // حذف همه فیلترها
    const removeAllFilters = () => {
        setSelectedProvince('');
        setSelectedCities([]);
        setSelectedCityFilter([]);
        setSelectedSpecialties([]);
        setSelectedSkills([]);
        setIsSpecialtyMultiSelect(false);
        setIsSkillMultiSelect(false);
        setIsCityMultiSelect(false);
        setIsCityFilterMultiSelect(false);
        setTempSpecialties([]);
        setTempSkills([]);
        setTempCities([]);
        setTempCityFilter([]);
        setOnlineOnly(false);
        setIncludeVIP(false);
        setSelectedConsultationType(null);
        setConsultationDuration(null);

        // به‌روزرسانی فیلترها
        const newFilters = {
            province: '',
            city: undefined,
            cities: undefined, // حذف فیلتر شهر
            specialty: undefined,
            skills: undefined,
            searchQuery: filters.searchQuery,
            onlineOnly: false,
            includeVIP: false,
            consultationType: undefined,
            duration: undefined
        };
        onFiltersChange(newFilters);
    };

    // آماده‌سازی آیتم‌ها برای مدال‌ها
    const locationItems = provincesData?.map(province => ({
        id: province.id,
        name: province.name,
        children: province.children.map(city => ({
            id: city.id,
            name: city.name
        }))
    })) || [];

    const specialtyItems = specialtiesData?.map(s => ({ id: s.id, name: s.title })) || [];

    // استفاده از لیست مسطح مهارت‌ها
    const skillItems = skillsData?.map(s => ({ id: s.id, name: s.title })) || [];

    // استفاده از لیست مسطح شهرها
    const cityFilterItems = citiesData?.map(city => ({ id: city.id, name: city.name })) || [];

    // آیتم‌های نوع مشاوره
    const consultationTypeItems = [
        { id: ConsultationType.IN_PERSON, name: 'مشاوره حضوری' },
        { id: ConsultationType.PHONE, name: 'مشاوره تلفنی' },
        { id: ConsultationType.VIDEO, name: 'مشاوره ویدئویی' },
        { id: ConsultationType.TEXT_CHAT, name: 'مشاوره چتی' },
    ];

    // آیتم‌های مدت مشاوره
    const durationItems = [
        { id: ConsultationDuration.MIN_15, name: '15 دقیقه' },
        { id: ConsultationDuration.MIN_30, name: '30 دقیقه' },
        { id: ConsultationDuration.MIN_45, name: '45 دقیقه' },
        { id: ConsultationDuration.MIN_60, name: '60 دقیقه' },
        { id: ConsultationDuration.MIN_90, name: '90 دقیقه' },
        { id: ConsultationDuration.MIN_120, name: '120 دقیقه' },
    ];

    // تابع کمکی برای دریافت نام نوع مشاوره
    function getConsultationTypeName(type: ConsultationType): string {
        switch (type) {
            case ConsultationType.IN_PERSON:
                return 'حضوری';
            case ConsultationType.PHONE:
                return 'تلفنی';
            case ConsultationType.VIDEO:
                return 'ویدئویی';
            case ConsultationType.TEXT_CHAT:
                return 'چتی';
            default:
                return '';
        }
    }

    // ترتیب‌بندی دکمه‌ها بر اساس فیلترهای فعال
    const filterButtons = [
       /* {
            id: 'location',
            type: 'شهر',
            showTypeOnSelectedState: false,
            // اصلاح منطق نمایش عنوان برای شهرها
            value: selectedCities.length > 0
                ? (selectedCities.length > 1
                    ? `${selectedCities[0]} و ${selectedCities.length - 1} شهر دیگر`
                    : selectedCities[0])
                : '',
            icon: <MapPin className="w-3.5 h-3.5 flex-shrink-0" />,
            active: selectedCities.length > 0,
            onClick: () => setOpenModal('location'),
            onRemove: removeLocation,
            show: true
        },*/
        {
            id: 'cityFilter',
            type: 'شهر',
            showTypeOnSelectedState: true,
            // منطق نمایش عنوان برای فیلتر شهر
            value: selectedCityFilter.length > 0
                ? (selectedCityFilter.length > 1
                    ? `${selectedCityFilter.length} شهر`
                    : selectedCityFilter[0])
                : '',
            icon: <MapPin className="w-3.5 h-3.5 flex-shrink-0" />,
            active: selectedCityFilter.length > 0,
            onClick: () => setOpenModal('cityFilter'),
            onRemove: removeCityFilter,
            show: true
        },
        {
            id: 'specialty',
            type: 'تخصص',
            showTypeOnSelectedState: true,
            // اصلاح منطق نمایش عنوان برای تخصص‌ها
            value: selectedSpecialties.length > 0
                ? (selectedSpecialties.length > 1
                    ? `${selectedSpecialties.length} تخصص`
                    : (specialtiesData?.find(s => s.id === selectedSpecialties[0])?.title || ''))
                : '',
            icon: <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />,
            active: selectedSpecialties.length > 0,
            onClick: () => setOpenModal('specialty'),
            onRemove: removeSpecialty,
            show: true
        },
        {
            id: 'skill',
            type: 'مهارت',
            showTypeOnSelectedState: true,
            // اصلاح منطق نمایش عنوان برای مهارت‌ها
            value: selectedSkills.length > 0
                ? (selectedSkills.length > 1
                    ? `${selectedSkills.length} مهارت`
                    : (skillsData?.find(s => s.id === selectedSkills[0])?.title || ''))
                : '',
            icon: <Wrench className="w-3.5 h-3.5 flex-shrink-0" />,
            active: selectedSkills.length > 0,
            onClick: () => setOpenModal('skill'),
            onRemove: removeSkill,
            show: true
        },
        /* {
             id: 'online',
             type: 'فقط آنلاین',
             showTypeOnSelectedState: false,
             value: 'فقط آنلاین',
             icon: <Wifi className="w-3.5 h-3.5 flex-shrink-0" />,
             active: onlineOnly,
             onClick: toggleOnlineOnly,
             onRemove: toggleOnlineOnly,
             show: true
         },
         {
             id: 'vip',
             type: 'فقط وکلای ویژه',
             showTypeOnSelectedState: false,
             value: 'فقط وکلای ویژه',
             icon: <Star className="w-3.5 h-3.5 flex-shrink-0" />,
             active: includeVIP,
             onClick: toggleIncludeVIP,
             onRemove: toggleIncludeVIP,
             show: true
         },*/
        {
            id: 'consultation',
            type: 'نوع مشاوره',
            showTypeOnSelectedState: false,
            value: selectedConsultationType ? getConsultationTypeName(selectedConsultationType) : '',
            icon: <Clock className="w-3.5 h-3.5 flex-shrink-0" />,
            active: !!selectedConsultationType,
            onClick: () => setOpenModal('consultation'),
            onRemove: removeConsultationType,
            show: true
        },
        {
            id: 'duration',
            type: 'مدت مشاوره',
            showTypeOnSelectedState: false,
            value: consultationDuration ? `${consultationDuration.replace('MIN_', '')} دقیقه` : '',
            icon: <Clock className="w-3.5 h-3.5 flex-shrink-0" />,
            active: !!consultationDuration,
            onClick: () => setOpenModal('duration'),
            onRemove: removeDuration,
            show: true
        },
    ];

    // مرتب‌سازی دکمه‌ها: دکمه‌های فعال اول، سپس دکمه‌های غیرفعال
    const sortedButtons = [...filterButtons].sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return 0;
    });

    // بررسی آیا فیلتری فعال است
    const hasActiveFilters = selectedProvince || selectedCities.length > 0 || selectedCityFilter.length > 0 || selectedSpecialties.length > 0 || selectedSkills.length > 0 || onlineOnly || includeVIP || selectedConsultationType || consultationDuration;

    return (
        <div className="mb-6">
            <div className="flex overflow-x-auto pb-2 gap-1 no-scrollbar">
                {/* دکمه حذف همه فیلترها */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        className="flex items-center justify-center h-8 w-8 border border-gray-200 rounded-full text-sm transition-all flex-shrink-0"
                        onClick={removeAllFilters}
                        title="حذف فیلترها"
                    >
                        <X className="w-4 h-4 text-red-500" />
                    </Button>
                )}

                {sortedButtons.map((button) => (
                    button.show && (
                        <Button
                            key={button.id}
                            variant="outline"
                            className={cn(
                                "flex items-center gap-1.5 whitespace-nowrap h-8 px-4 border border-gray-200 rounded-full text-sm transition-all flex-shrink-0",
                                button.active && "border-[#ca2a30] text-[#ca2a30] bg-red-50"
                            )}
                            onClick={button.onClick}
                        >
                            {button.icon}
                            {button.active ? (
                                <>
                                    {button.showTypeOnSelectedState && (
                                        <span className="text-xs text-gray-500">{button.type}:</span>
                                    )}
                                    <span className="text-sm font-medium truncate max-w-[150px]">{button.value}</span>
                                </>
                            ) : (
                                <span>{button.type}</span>
                            )}
                            {button.active && (
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    button.onRemove();
                                }}>
                                    <X className="w-3.5 h-3.5 ml-1 flex-shrink-0 text-red-500" />
                                </div>
                            )}
                        </Button>
                    )
                ))}

                {/* منوی کشویی مرتب‌سازی */}
                <SortDropdown
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={onSortChange}
                />
            </div>

            {/* مدال انتخاب شهر (فیلتر جداگانه) */}
            <FilterModal
                open={openModal === 'cityFilter'}
                onOpenChange={(open) => {
                    setOpenModal(open ? 'cityFilter' : null);
                    // هنگام بستن مدال، اگر در حالت چند انتخابی بودیم، مقادیر را اعمال می‌کنیم
                    if (!open && isCityFilterMultiSelect && tempCityFilter.length > 0) {
                        setSelectedCityFilter([...tempCityFilter]);

                        // به‌روزرسانی فیلترها
                        const newFilters = {
                            ...filters,
                            cities: tempCityFilter.length > 0 ? tempCityFilter : undefined
                        };
                        onFiltersChange(newFilters);
                    }
                }}
                title="انتخاب شهر"
                multipleTitle={"جستجو در چند شهر"}
                items={cityFilterItems}
                selectedItems={isCityFilterMultiSelect ? tempCityFilter : selectedCityFilter}
                onItemSelect={handleCityFilterSelect}
                placeholder="جستجوی شهر..."
                isMobile={false}
                showMultiSelectToggle={true}
                onMultiSelectToggle={handleCityFilterMultiSelectToggle}
                multiSelect={isCityFilterMultiSelect}
                maxSelect={5}
                onApply={applyMultiSelectCityFilter}
                showSelectedItems={true}
                onRemoveSelectedItem={handleRemoveCityFilter}
            />

            {/* مدال انتخاب شهر (مربوط به استان)
            <FilterModal
                open={openModal === 'location'}
                onOpenChange={(open) => {
                    setOpenModal(open ? 'location' : null);
                    // هنگام بستن مدال، اگر در حالت چند انتخابی بودیم، مقادیر را اعمال می‌کنیم
                    if (!open && isCityMultiSelect && tempCities.length > 0) {
                        setSelectedCities([...tempCities]);

                        // به‌روزرسانی فیلترها
                        const newFilters = {
                            ...filters,
                            city: tempCities.length > 0 ? tempCities : undefined
                        };
                        onFiltersChange(newFilters);
                    }
                }}
                title="انتخاب شهر"
                multipleTitle={"جستجو در چند شهر"}
                items={locationItems}
                selectedItems={isCityMultiSelect ? tempCities : selectedCities}
                onItemSelect={handleCitySelect}
                placeholder="جستجوی استان..."
                placeholder2={"جستجوی شهر..."}
                isMobile={false}
                showMultiSelectToggle={true}
                onMultiSelectToggle={handleCityMultiSelectToggle}
                multiSelect={isCityMultiSelect}
                maxSelect={5}
                onApply={applyMultiSelectCities}
                showSelectedItems={true}
                onRemoveSelectedItem={handleRemoveCity}
            />*/}

            {/* مدال انتخاب تخصص */}
            <FilterModal
                open={openModal === 'specialty'}
                onOpenChange={(open) => {
                    setOpenModal(open ? 'specialty' : null);
                    // هنگام بستن مدال، اگر در حالت چند انتخابی بودیم، مقادیر را اعمال می‌کنیم
                    if (!open && isSpecialtyMultiSelect && tempSpecialties.length > 0) {
                        setSelectedSpecialties([...tempSpecialties]);

                        // به‌روزرسانی فیلترها
                        const newFilters = {
                            ...filters,
                            specialty: tempSpecialties.length > 0 ? tempSpecialties : undefined
                        };
                        onFiltersChange(newFilters);
                    }
                }}
                title="انتخاب تخصص"
                multipleTitle={"فقط وکلایی با چند تخصص"}
                items={specialtyItems}
                selectedItems={isSpecialtyMultiSelect ? tempSpecialties.map(id => specialtiesData?.find(s => s.id === id)?.title || '') : selectedSpecialties.map(id => specialtiesData?.find(s => s.id === id)?.title || '')}
                onItemSelect={handleSpecialtySelect}
                placeholder="جستجوی تخصص..."
                isMobile={false}
                showMultiSelectToggle={true}
                onMultiSelectToggle={handleSpecialtyMultiSelectToggle}
                multiSelect={isSpecialtyMultiSelect}
                maxSelect={3}
                onApply={applyMultiSelectSpecialties}
                showSelectedItems={true}
                onRemoveSelectedItem={handleRemoveSpecialty}
            />

            {/* مدال انتخاب مهارت */}
            <FilterModal
                open={openModal === 'skill'}
                onOpenChange={(open) => {
                    setOpenModal(open ? 'skill' : null);
                    // هنگام بستن مدال، اگر در حالت چند انتخابی بودیم، مقادیر را اعمال می‌کنیم
                    if (!open && isSkillMultiSelect && tempSkills.length > 0) {
                        setSelectedSkills([...tempSkills]);

                        // به‌روزرسانی فیلترها
                        const newFilters = {
                            ...filters,
                            skills: tempSkills.length > 0 ? tempSkills : undefined
                        };
                        onFiltersChange(newFilters);
                    }
                }}
                title="انتخاب مهارت"
                multipleTitle={"انتخاب وکلایی با چند مهارت"}
                items={skillItems}
                selectedItems={isSkillMultiSelect ? tempSkills.map(id => skillsData?.find(s => s.id === id)?.title || '') : selectedSkills.map(id => skillsData?.find(s => s.id === id)?.title || '')}
                onItemSelect={handleSkillSelect}
                placeholder="جستجوی مهارت..."
                isMobile={false}
                showMultiSelectToggle={true}
                onMultiSelectToggle={handleSkillMultiSelectToggle}
                multiSelect={isSkillMultiSelect}
                maxSelect={10}
                onApply={applyMultiSelectSkills}
                showSelectedItems={true}
                onRemoveSelectedItem={handleRemoveSkill}
            />

            {/* مدال انتخاب نوع مشاوره */}
            <FilterModal
                open={openModal === 'consultation'}
                onOpenChange={(open) => setOpenModal(open ? 'consultation' : null)}
                title="انتخاب نوع مشاوره"
                items={consultationTypeItems}
                selectedItems={selectedConsultationType ? [selectedConsultationType] : []}
                onItemSelect={(name, id) => {
                    const newType = selectedConsultationType === id ? null : id as ConsultationType;
                    setSelectedConsultationType(newType);

                    // به‌روزرسانی فیلترها
                    const newFilters = {
                        ...filters,
                        consultationType: newType
                    };
                    onFiltersChange(newFilters);
                    setOpenModal(null);
                }}
                placeholder="جستجوی نوع مشاوره..."
                isMobile={false}
            />

            {/* مدال انتخاب مدت مشاوره */}
            <FilterModal
                open={openModal === 'duration'}
                onOpenChange={(open) => setOpenModal(open ? 'duration' : null)}
                title="انتخاب مدت مشاوره"
                items={durationItems}
                selectedItems={consultationDuration ? [consultationDuration] : []}
                onItemSelect={(name, id) => {
                    const newDuration = consultationDuration === id ? null : id as ConsultationDuration;
                    setConsultationDuration(newDuration);

                    // به‌روزرسانی فیلترها
                    const newFilters = {
                        ...filters,
                        duration: newDuration
                    };
                    onFiltersChange(newFilters);
                    setOpenModal(null);
                }}
                placeholder="جستجوی مدت زمان..."
                isMobile={false}
            />
        </div>
    );
}