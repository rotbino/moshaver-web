// app/admin/arm/components/FormLabelsSection.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Save, Loader2, Check, Search, X, Tag, Globe, Plus, Trash2, Pencil, FileText, ChevronRight, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface FormLabelsSectionProps {
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    onSave?: () => void;
    isSaving?: boolean;
    isAdmin?: boolean;
}

const DEFAULT_LABELS: Record<string, Record<string, string>> = {
    business: {
        'business.name.label': 'نام کسب‌وکار',
        'business.name.placeholder': 'مثال: تولیدی بلوک آرمانی',
        'business.shortDescription.label': 'توضیح کوتاه کسب‌وکار',
        'business.shortDescription.placeholder': 'مثال: تولید کننده انواع آجر فشاری',
        'business.shortDescription.hint': 'حداکثر ۵۰ کاراکتر',
        'business.role.label': 'نقش اصلی شما در این بازار',
        'business.role.seller.title': 'فروشنده عمده',
        'business.role.seller.desc': 'تولیدی، بنکدار، عمده‌فروش',
        'business.role.buyer.title': 'خریدار عمده',
        'business.role.buyer.desc': 'پیمانکار، خرده‌فروش، مجری',
        'business.industry.label': 'صنف کسب‌وکار',
        'business.location.label': 'موقعیت مکانی',
        'business.submit': 'ثبت کسب‌وکار',
    },
    ad: {
        'ad.category.label': 'نوع کالا و دسته‌بندی',
        'ad.category.search': 'جستجوی دسته‌بندی...',
        'ad.productType.label': 'نوع کالا',
        'ad.productType.placeholder': 'مثال: پرتلند تیپ ۲',
        'ad.price.title': 'قیمت‌گذاری',
        'ad.price.description': 'در فروش عمده، قیمت معمولاً به میزان خرید بستگی دارد.',
        'ad.minQuantity.label': 'حداقل حجم فروش',
        'ad.minQuantity.placeholder': 'مثلاً: ۱۰۰۰',
        'ad.unitPrice.label': 'قیمت هر واحد',
        'ad.unitPrice.placeholder': 'مثلاً: ۵,۰۰۰,۰۰۰',
        'ad.availableQuantity.label': 'موجودی فعلی انبار',
        'ad.availableQuantity.placeholder': 'موجودی را وارد کنید',
        'ad.location.label': 'محل کالا',
        'ad.location.placeholder': 'انتخاب شهر...',
        'ad.validity.label': 'مدت اعتبار قیمت',
        'ad.bump.label': 'نردبان (بالاترین نمایش)',
        'ad.bump.desc': '۱ روز • مصرف {bumpCost} اعتبار',
        'ad.anonymous.label': 'انتشار ناشناس',
        'ad.credit.label': 'اعتبار شما',
        'ad.free.label': 'ثبت این آگهی رایگان است',
        'ad.submit': 'ثبت قیمت و انتشار',
    },
    profile: {
        'profile.businessTitle': 'کسب‌وکار من',
        'profile.creditTitle': 'کیف اعتبار',
        'profile.adsTitle': 'آگهی‌های من',
        'profile.noBusiness': 'هنوز کسب‌وکاری ثبت نکرده‌اید',
        'profile.noAds': 'هنوز آگهی ثبت نکرده‌اید',
    },
    nav: {
        'nav.priceTable': 'تابلو قیمت',
        'nav.addPrice': 'ثبت قیمت',
        'nav.profile': 'پروفایل',
    },
};

const FORM_ICONS: Record<string, any> = {
    business: FileText,
    ad: Tag,
    profile: Globe,
    nav: Layers,
};

export function FormLabelsSection({ watch, setValue, onSave, isSaving, isAdmin = false }: FormLabelsSectionProps) {
    const [saved, setSaved] = useState(false);
    const [search, setSearch] = useState('');
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [activeForm, setActiveForm] = useState<string | null>(null);

    // ⬇ stateهای ادمین
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddKey, setShowAddKey] = useState(false);
    const [newFormName, setNewFormName] = useState('');
    const [newFormLabel, setNewFormLabel] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newKeyFormTarget, setNewKeyFormTarget] = useState<string>('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const customLabels = watch('config.formLabels') || {};
    const setLabel = (key: string, value: string) => setValue('config.formLabels', { ...customLabels, [key]: value });
    const removeLabel = (key: string) => {
        const updated = { ...customLabels };
        delete updated[key];
        setValue('config.formLabels', updated);
    };

    const handleSave = () => { onSave?.(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

    // لیست فرم‌های موجود (پیش‌فرض + سفارشی)
    const formList = useMemo(() => {
        const forms = new Set<string>();
        Object.keys(DEFAULT_LABELS).forEach(f => forms.add(f));
        Object.keys(customLabels).forEach(k => {
            const prefix = k.split('.')[0];
            if (!DEFAULT_LABELS[prefix]) forms.add(prefix);
        });
        return [...forms];
    }, [customLabels]);

    // همه کلیدهای یک فرم خاص
    const getFormEntries = (formKey: string): [string, string][] => {
        const defaults = DEFAULT_LABELS[formKey] || {};
        const merged = { ...defaults };
        Object.entries(customLabels).forEach(([k, v]) => {
            if (k.startsWith(formKey + '.') && v) merged[k] = v as string;
        });
        // فیلتر جستجو
        if (!search.trim()) return Object.entries(merged);
        const q = search.toLowerCase();
        return Object.entries(merged).filter(([k, v]) =>
            k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );
    };

    // ═══════════ handlers ═══════════
    const startEdit = (key: string, currentValue: string) => { setEditingKey(key); setEditValue(currentValue); };

    const saveEdit = () => {
        if (editingKey) {
            editValue.trim() ? setLabel(editingKey, editValue.trim()) : removeLabel(editingKey);
            setEditingKey(null);
        }
    };

    // ادمین: افزودن فرم جدید
    const handleAddForm = () => {
        if (!newFormName.trim()) { toast.error('کلید فرم را وارد کنید'); return; }
        if (DEFAULT_LABELS[newFormName.trim()]) { toast.error('این فرم قبلاً وجود دارد'); return; }
        setLabel(`${newFormName.trim()}.__form_label`, newFormLabel.trim() || newFormName.trim());
        setNewFormName('');
        setNewFormLabel('');
        setShowAddForm(false);
        toast.success('فرم جدید اضافه شد');
    };

    // ادمین: افزودن کلید به فرم
    const handleAddKey = () => {
        if (!newKey.trim()) { toast.error('کلید را وارد کنید'); return; }
        const fullKey = `${newKeyFormTarget}.${newKey.trim()}`;
        if (getFormEntries(newKeyFormTarget).some(([k]) => k === fullKey)) { toast.error('این کلید قبلاً وجود دارد'); return; }
        setLabel(fullKey, newValue.trim() || '');
        setNewKey('');
        setNewValue('');
        setShowAddKey(false);
        toast.success('کلید اضافه شد');
    };

    const handleDeleteKey = (key: string) => {
        const isDefault = Object.values(DEFAULT_LABELS).some(f => f[key] !== undefined);
        isDefault ? removeLabel(key) : removeLabel(key);
        setDeleteConfirm(null);
        toast.success('حذف شد');
    };

    const handleRenameKey = (oldKey: string) => {
        const newName = prompt('کلید جدید:', oldKey);
        if (newName && newName.trim() && newName.trim() !== oldKey) {
            const value = getFormEntries(oldKey.split('.')[0]).find(([k]) => k === oldKey)?.[1] || '';
            removeLabel(oldKey);
            setLabel(newName.trim(), value);
            toast.success('تغییر نام یافت');
        }
    };

    const isCustomized = (key: string) => customLabels[key] !== undefined && customLabels[key] !== '';

    return (
        <div className="space-y-6">
            {/* هدر */}
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div>
                    <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2"><Tag className="w-5 h-5 text-primary" />برچسب‌های فرم‌ها</h3>
                    <p className="text-xs text-on-surface-variant">{isAdmin ? 'مدیریت فرم‌ها و کلیدها' : 'شخصی‌سازی متن ها برای بازار'}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <button type="button" onClick={() => { setShowAddForm(true); setShowAddKey(false); }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-outline rounded-lg text-xs font-medium hover:bg-surface-container-low transition-colors">
                            <Plus className="w-3.5 h-3.5" />فرم جدید
                        </button>
                    )}
                    <button type="button" onClick={handleSave} disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        ذخیره
                    </button>
                </div>
            </div>

            {/* جستجو */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی کلید یا مقدار..."
                       className="w-full bg-surface-container-lowest border border-outline rounded-xl h-10 pr-10 pl-4 text-sm focus:ring-1 focus:ring-primary/30 outline-none" />
            </div>

            {/* فرم‌ها - نوار افقی */}
            <div className="flex flex-wrap gap-2">
                {formList.map(formKey => {
                    const Icon = FORM_ICONS[formKey] || FileText;
                    const isActive = activeForm === formKey;
                    const entryCount = getFormEntries(formKey).length;
                    const formLabel = customLabels[`${formKey}.__form_label`] ||
                        { business: 'کسب‌وکار', ad: 'ثبت آگهی', profile: 'پروفایل', nav: 'ناوبری' }[formKey] || formKey;
                    return (
                        <button key={formKey} type="button"
                                onClick={() => { setActiveForm(isActive ? null : formKey); setEditingKey(null); }}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                                    isActive ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:border-primary/30'
                                }`}>
                            <Icon className="w-4 h-4" />
                            {formLabel}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-on-primary/20' : 'bg-surface-container-high'}`}>{entryCount}</span>
                        </button>
                    );
                })}
            </div>

            {/* محتوای فرم انتخاب شده */}
            {activeForm && (
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden">
                    <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {(() => { const Icon = FORM_ICONS[activeForm] || FileText; return <Icon className="w-4 h-4 text-primary" />; })()}
                            <span className="text-sm font-semibold">{customLabels[`${activeForm}.__form_label`] || { business: 'کسب‌وکار', ad: 'ثبت آگهی', profile: 'پروفایل', nav: 'ناوبری' }[activeForm] || activeForm}</span>
                            <span className="text-xs text-on-surface-variant">({getFormEntries(activeForm).length})</span>
                        </div>
                        {isAdmin && (
                            <button type="button" onClick={() => { setNewKeyFormTarget(activeForm); setShowAddKey(true); setShowAddForm(false); }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                                <Plus className="w-3 h-3" />افزودن کلید
                            </button>
                        )}
                    </div>
                    <div className="divide-y divide-outline-variant/10 max-h-[400px] overflow-y-auto">
                        {getFormEntries(activeForm).map(([key, value]) => (
                            <div key={key} className={`px-4 py-2.5 flex items-center gap-3 hover:bg-surface-container-low transition-colors group ${isCustomized(key) ? 'bg-primary/5' : ''}`}>
                                <div className="w-1/3 min-w-0">
                                    <p className="text-xs font-mono text-on-surface-variant/60 truncate">{key}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    {editingKey === key ? (
                                        <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                                               onBlur={saveEdit} onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                               autoFocus className="w-full bg-surface border border-primary rounded-lg h-8 px-2 text-xs focus:ring-1 focus:ring-primary/30 outline-none" />
                                    ) : (
                                        <p className={`text-sm truncate cursor-pointer ${isCustomized(key) ? 'text-primary font-medium' : 'text-on-surface'}`}
                                           onClick={() => startEdit(key, value)}>{value}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    {isCustomized(key) && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">سفارشی</span>}
                                    {isAdmin && (
                                        <>
                                            <button onClick={() => handleRenameKey(key)} className="p-1 hover:bg-primary/10 rounded" title="تغییر نام"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setDeleteConfirm(key)} className="p-1 hover:bg-error/10 rounded" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {getFormEntries(activeForm).length === 0 && (
                            <div className="text-center py-12 text-sm text-on-surface-variant">موردی یافت نشد</div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════ مودال: افزودن فرم جدید ═══════════ */}
            {showAddForm && isAdmin && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h3 className="text-lg font-semibold">افزودن فرم جدید</h3>
                            <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-surface-container-high rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs text-on-surface-variant block mb-1">کلید فرم (انگلیسی)</label>
                                <input type="text" value={newFormName} onChange={e => setNewFormName(e.target.value)}
                                       placeholder="مثال: checkout" dir="ltr"
                                       className="w-full bg-surface-container-lowest border border-outline rounded-xl h-10 px-3 text-sm font-mono focus:ring-1 focus:ring-primary/30 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant block mb-1">نام نمایشی فرم</label>
                                <input type="text" value={newFormLabel} onChange={e => setNewFormLabel(e.target.value)}
                                       placeholder="مثال: پرداخت"
                                       className="w-full bg-surface-container-lowest border border-outline rounded-xl h-10 px-3 text-sm focus:ring-1 focus:ring-primary/30 outline-none" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddForm(false)} className="flex-1 h-10 border border-outline rounded-xl text-sm">انصراف</button>
                                <button onClick={handleAddForm} className="flex-1 h-10 bg-primary text-on-primary rounded-xl text-sm font-medium">افزودن</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ مودال: افزودن کلید به فرم ═══════════ */}
            {showAddKey && isAdmin && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h3 className="text-lg font-semibold">افزودن کلید به {customLabels[`${newKeyFormTarget}.__form_label`] || newKeyFormTarget}</h3>
                            <button onClick={() => setShowAddKey(false)} className="p-1.5 hover:bg-surface-container-high rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs text-on-surface-variant block mb-1">کلید (ادامه مسیر)</label>
                                <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)}
                                       placeholder="مثال: title.placeholder" dir="ltr"
                                       className="w-full bg-surface-container-lowest border border-outline rounded-xl h-10 px-3 text-sm font-mono focus:ring-1 focus:ring-primary/30 outline-none" />
                                <p className="text-[10px] text-on-surface-variant/50 mt-1">کلید کامل: {newKeyFormTarget}.{newKey || '...'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant block mb-1">مقدار</label>
                                <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)}
                                       placeholder="متن نمایشی"
                                       className="w-full bg-surface-container-lowest border border-outline rounded-xl h-10 px-3 text-sm focus:ring-1 focus:ring-primary/30 outline-none" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddKey(false)} className="flex-1 h-10 border border-outline rounded-xl text-sm">انصراف</button>
                                <button onClick={handleAddKey} className="flex-1 h-10 bg-primary text-on-primary rounded-xl text-sm font-medium">افزودن</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ مودال تأیید حذف ═══════════ */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl border border-outline-variant">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h3 className="text-lg font-semibold">تأیید حذف</h3>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 hover:bg-surface-container-high rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-sm">حذف کلید <span className="font-mono text-xs bg-surface-container-high px-1.5 py-0.5 rounded">{deleteConfirm}</span>؟</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 border border-outline rounded-xl text-sm">انصراف</button>
                                <button onClick={() => handleDeleteKey(deleteConfirm)} className="flex-1 h-10 bg-error text-on-error rounded-xl text-sm">حذف</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}