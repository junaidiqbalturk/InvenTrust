"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr';

const translations = {
    en: {
        welcome: "Welcome to InvenTrust",
        dashboard: "Dashboard",
        imports: "Global Imports",
        exports: "Global Exports",
        inventory: "Inventory",
        finance: "Finance Hub",
        settings: "Settings",
        getStarted: "Start Free Trial",
        createWorkspace: "Create Your Workspace",
        continue: "Continue",
        workspaceReady: "Your workspace is ready!",
        settingUp: "Setting things up for you...",
        personalInfo: "Personal Info",
        workspaceInfo: "Workspace Info"
    },
    es: {
        welcome: "Bienvenido a InvenTrust",
        dashboard: "Panel de Control",
        imports: "Importaciones Globales",
        exports: "Exportaciones Globales",
        inventory: "Inventario",
        finance: "Centro Financiero",
        settings: "Configuración",
        getStarted: "Iniciar Prueba Gratuita",
        createWorkspace: "Crea tu Espacio de Trabajo",
        continue: "Continuar",
        workspaceReady: "¡Tu espacio de trabajo está listo!",
        settingUp: "Preparando todo para ti...",
        personalInfo: "Información Personal",
        workspaceInfo: "Información del Espacio"
    },
    fr: {
        welcome: "Bienvenue sur InvenTrust",
        dashboard: "Tableau de Bord",
        imports: "Importations Globales",
        exports: "Exportations Globales",
        inventory: "Inventaire",
        finance: "Centre Financier",
        settings: "Paramètres",
        getStarted: "Commencer l'essai gratuit",
        createWorkspace: "Créez votre espace de travail",
        continue: "Continuer",
        workspaceReady: "Votre espace de travail est prêt !",
        settingUp: "Nous préparons tout pour vous...",
        personalInfo: "Infos Personnelles",
        workspaceInfo: "Infos sur l'Espace"
    }
};

interface TranslationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    // Auto-detect language from browser or IP-based detection logic
    useEffect(() => {
        const storedLang = localStorage.getItem('language') as Language;
        if (storedLang && ['en', 'es', 'fr'].includes(storedLang)) {
            setLanguage(storedLang);
        } else {
            // Check browser language
            const browserLang = navigator.language.split('-')[0];
            if (['en', 'es', 'fr'].includes(browserLang)) {
                setLanguage(browserLang as Language);
            }
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: keyof typeof translations['en']): string => {
        return translations[language][key] || translations['en'][key];
    };

    return (
        <TranslationContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) throw new Error('useTranslation must be used within a TranslationProvider');
    return context;
};
