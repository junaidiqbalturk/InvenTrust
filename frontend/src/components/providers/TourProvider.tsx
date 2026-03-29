"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X, Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
    startTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    closeTour: () => void;
    isTourActive: boolean;
    currentStep: number;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'sidebar-dashboard',
        title: 'Central Command',
        content: 'Welcome to your InvenTrust Dashboard. Here you can see your real-time analytics and global trade status.',
        position: 'right'
    },
    {
        targetId: 'sidebar-imports',
        title: 'Manage Imports',
        content: 'Track every import shipment, manage documentation, and handle customs clearance with ease.',
        position: 'right'
    },
    {
        targetId: 'sidebar-exports',
        title: 'Global Exports',
        content: 'Orchestrate your outgoing trade lifecycle from sales order to final delivery.',
        position: 'right'
    },
    {
        targetId: 'company-branding',
        title: 'Workspace Settings',
        content: 'Personalize your workspace with your company logo and theme colors here.',
        position: 'right'
    }
];

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isTourActive, setIsTourActive] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isFinishing, setIsFinishing] = useState(false);

    // Start tour automatically for new users
    useEffect(() => {
        if (user && !user.has_completed_onboarding) {
            // Short delay to ensure dashboard elements are rendered
            const timer = setTimeout(() => {
                startTour();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user?.id, user?.has_completed_onboarding]);

    // Update target position when step changes
    useEffect(() => {
        if (isTourActive) {
            const element = document.getElementById(TOUR_STEPS[currentStep].targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTargetRect(element.getBoundingClientRect());
                // Highlight the element
                element.classList.add('ring-4', 'ring-primary', 'ring-offset-4', 'ring-offset-[#020617]', 'transition-all', 'duration-500');
            }
        }
        return () => {
            // Cleanup highlighs
            const element = document.getElementById(TOUR_STEPS[currentStep].targetId);
            if (element) {
                element.classList.remove('ring-4', 'ring-primary', 'ring-offset-4', 'ring-offset-[#020617]');
            }
        };
    }, [currentStep, isTourActive]);

    const startTour = () => {
        setCurrentStep(0);
        setIsTourActive(true);
    };

    const nextStep = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishOnboarding();
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const closeTour = () => {
        setIsTourActive(false);
    };

    const finishOnboarding = async () => {
        setIsFinishing(true);
        try {
            const { data } = await api.post('/complete-onboarding');
            updateUser(data.user);
            setIsTourActive(false);
        } catch (error) {
            console.error("Failed to persist onboarding status:", error);
            setIsTourActive(false);
        } finally {
            setIsFinishing(false);
        }
    };

    return (
        <TourContext.Provider value={{ startTour, nextStep, prevStep, closeTour, isTourActive, currentStep }}>
            {children}
            
            <AnimatePresence>
                {isTourActive && targetRect && (
                    <div className="fixed inset-0 z-[9999] pointer-events-none">
                        {/* Overlay Backdrop with cutout hole effect */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        />

                        {/* Animated Tooltip */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                top: targetRect.top + (TOUR_STEPS[currentStep].position === 'bottom' ? targetRect.height + 20 : -120),
                                left: targetRect.left + (TOUR_STEPS[currentStep].position === 'right' ? targetRect.width + 20 : 0)
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute pointer-events-auto w-[320px] bg-[#020617] border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-black/50 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={closeTour} className="text-slate-500 hover:text-white transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-white font-black tracking-tight">{TOUR_STEPS[currentStep].title}</h3>
                                </div>

                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {TOUR_STEPS[currentStep].content}
                                </p>

                                <div className="pt-4 flex items-center justify-between gap-4">
                                    <div className="flex gap-1">
                                        {TOUR_STEPS.map((_, i) => (
                                            <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${currentStep === i ? 'bg-primary' : 'bg-white/10'}`} />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {currentStep > 0 && (
                                            <Button variant="ghost" size="sm" onClick={prevStep} className="text-slate-400 hover:text-white h-10 px-3 rounded-xl">
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button 
                                            size="sm" 
                                            onClick={nextStep} 
                                            disabled={isFinishing}
                                            className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-primary/20"
                                        >
                                            {isFinishing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative gradient */}
                            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-primary/10 blur-[40px] rounded-full" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) throw new Error('useTour must be used within a TourProvider');
    return context;
};
