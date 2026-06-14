"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  TutorialStep,
  ONBOARDING_STEPS,
  PAGE_TUTORIALS,
  ONBOARDING_STORAGE_KEY,
  DEMO_ORDER_ID,
  DEMO_TUTORIAL_ORDER,
  DEMO_TUTORIAL_ORDER_PROFILE,
  DEMO_TRANSACTION,
} from "@/lib/tutorials";
import TutorialOverlay from "./TutorialOverlay";
import TermsModal from "./TermsModal";
export { TutorialHelpButton } from "./TutorialOverlay";

interface TutorialContextType {
  isActive: boolean;
  mode: "onboarding" | "page" | null;
  currentStep: TutorialStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isOnboarding: boolean;
  isPageTutorial: boolean;
  nextStep: () => void;
  prevStep: () => void;
  finishTutorial: () => void;
  skipTutorial: () => void;
  startPageTutorial: (page: string) => void;
  triggerAdvance: (id?: string) => void;
  includeDemoOrder: boolean;
  demoOrder: any;
  demoOrderProfile: any;
  demoTransaction: any;
  setDemoOrderAccepted: (v: boolean) => void;
  demoOrderAccepted: boolean;
  setTutorialTrackingAdded: (v: boolean) => void;
  setTutorialStatusChanged: (v: boolean) => void;
  setTutorialWithdrawalDone: (v: boolean) => void;
  setTutorialTermsAccepted: (v: boolean) => void;
  completeOnboarding: () => Promise<void>;
}

const TutorialContext = createContext<TutorialContextType>({
  isActive: false,
  mode: null,
  currentStep: null,
  currentStepIndex: 0,
  totalSteps: 0,
  isOnboarding: false,
  isPageTutorial: false,
  nextStep: () => {},
  prevStep: () => {},
  finishTutorial: () => {},
  skipTutorial: () => {},
  startPageTutorial: () => {},
  triggerAdvance: () => {},
  includeDemoOrder: false,
  demoOrder: null,
  demoOrderProfile: null,
  demoTransaction: null,
  setDemoOrderAccepted: () => {},
  demoOrderAccepted: false,
  setTutorialTrackingAdded: () => {},
  setTutorialStatusChanged: () => {},
  setTutorialWithdrawalDone: () => {},
  setTutorialTermsAccepted: () => {},
  completeOnboarding: async () => {},
});

export function useTutorial() {
  return useContext(TutorialContext);
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"onboarding" | "page" | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [pageTutorial, setPageTutorial] = useState<string | null>(null);
  const [includeDemoOrder, setIncludeDemoOrder] = useState(false);
  const [demoOrderAccepted, setDemoOrderAccepted] = useState(false);
  const [tutorialTrackingAdded, setTutorialTrackingAdded] = useState(false);
  const [tutorialStatusChanged, setTutorialStatusChanged] = useState(false);
  const [tutorialWithdrawalDone, setTutorialWithdrawalDone] = useState(false);
  const [tutorialTermsAccepted, setTutorialTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const savedStartIndex = useRef(0);
  const prevPathname = useRef(pathname);

  const currentStep = steps[currentStepIndex] || null;
  const isOnboarding = mode === "onboarding";
  const isPageTutorial = mode === "page";
  const totalSteps = steps.length;

  const closeTutorial = useCallback(() => {
    setIsActive(false);
    setMode(null);
    setCurrentStepIndex(0);
    setSteps([]);
    setPageTutorial(null);
    setIncludeDemoOrder(false);
    setDemoOrderAccepted(false);
    setTutorialTrackingAdded(false);
    setTutorialStatusChanged(false);
    setTutorialWithdrawalDone(false);
    setTutorialTermsAccepted(false);
    if (isOnboarding) {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, [isOnboarding]);

  const completeOnboarding = useCallback(async () => {
    if (sellerId) {
      try {
        await fetch("/api/sellers/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sellerId, tutorial_seen: true }),
        });
        const stored = localStorage.getItem("seller-loopy-auth");
        if (stored) {
          const seller = JSON.parse(stored);
          seller.tutorial_seen = true;
          localStorage.setItem("seller-loopy-auth", JSON.stringify(seller));
        }
      } catch {
        console.error("Failed to save tutorial_seen");
      }
    }
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIncludeDemoOrder(false);
    closeTutorial();
    toast.success("Onboarding complete! You're all set.");
    router.push("/dashboard");
  }, [sellerId, closeTutorial, router]);

  const skipTutorial = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const finishTutorial = useCallback(() => {
    if (isOnboarding) {
      completeOnboarding();
    } else {
      closeTutorial();
    }
  }, [isOnboarding, completeOnboarding, closeTutorial]);

  const nextStep = useCallback(() => {
    if (steps.length > 0 && currentStepIndex === steps.length - 1) {
      finishTutorial();
      return;
    }
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [steps.length, currentStepIndex, finishTutorial]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const startPageTutorial = useCallback((page: string) => {
    if (window.innerWidth < 640) return;
    const pt = PAGE_TUTORIALS[page];
    if (!pt) return;
    setMode("page");
    setPageTutorial(page);
    setSteps(pt.steps);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const triggerAdvance = useCallback(
    (id?: string) => {
      if (!isActive || !currentStep) return;
      if (id && id !== currentStep.id && !id.startsWith(currentStep.id)) return;
      if (!currentStep.actionRequired) return;
      nextStep();
    },
    [isActive, currentStep, nextStep]
  );

  const demoOrder = includeDemoOrder ? DEMO_TUTORIAL_ORDER : null;
  const demoOrderProfile = includeDemoOrder ? DEMO_TUTORIAL_ORDER_PROFILE : null;
  const demoTransaction = includeDemoOrder ? DEMO_TRANSACTION : null;

  const handleTermsAccept = async () => {
    try {
      await fetch("/api/sellers/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sellerId, terms_accepted: true }),
      });
      const stored = localStorage.getItem("seller-loopy-auth");
      if (stored) {
        const seller = JSON.parse(stored);
        seller.terms_accepted = true;
        localStorage.setItem("seller-loopy-auth", JSON.stringify(seller));
      }
    } catch {
      console.error("Failed to save terms_accepted");
    }
    setShowTermsModal(false);
    startOnboarding(savedStartIndex.current);
  };

  const startOnboarding = (startIndex = 0) => {
    setMode("onboarding");
    setSteps(ONBOARDING_STEPS);
    setCurrentStepIndex(startIndex);
    setIsActive(true);
  };

  // Auto-start onboarding on mount (skip on phones)
  useEffect(() => {
    if (window.innerWidth < 640) return;
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) return;
    try {
      const seller = JSON.parse(stored);
      setSellerId(seller.id);
      if (seller.tutorial_seen === true || seller.tutorial_seen === "true") return;

      // Check for saved progress
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      let startIndex = 0;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.mode === "onboarding" && typeof parsed.index === "number") {
            startIndex = parsed.index;
          }
        } catch {}
      }

      // Check if terms have been accepted
      if (!(seller.terms_accepted === true || seller.terms_accepted === "true")) {
        savedStartIndex.current = startIndex;
        setShowTermsModal(true);
        return;
      }

      startOnboarding(startIndex);
    } catch {
      // ignore
    }
  }, []);

  // Save onboarding progress
  useEffect(() => {
    if (isOnboarding && isActive) {
      localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify({ mode: "onboarding", index: currentStepIndex })
      );
    }
  }, [isOnboarding, isActive, currentStepIndex]);

  // Detect navigation changes for onboarding flow
  useEffect(() => {
    if (!isOnboarding || !isActive || !currentStep) return;
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    if (currentStep.actionType === "navigate" && currentStep.actionRoute) {
      if (pathname === currentStep.actionRoute && prev !== pathname) {
        // Wait a tick for page to render
        setTimeout(() => nextStep(), 300);
      }
    }
  }, [pathname, isOnboarding, isActive, currentStep, nextStep]);

  // Enable demo order when reaching orders section of onboarding
  useEffect(() => {
    if (!isOnboarding || !isActive || !currentStep) return;
    const orderStepIds = ["orders-nav", "orders-overview", "orders-demo-order", "orders-accept", "orders-after-accept", "orders-tracking", "orders-status"];
    const txStepIds = ["transactions-nav", "transactions-overview", "transactions-demo-row", "transactions-clearing", "transactions-cleared", "transactions-withdraw", "transactions-withdraw-confirm"];
    const isOrderSection = orderStepIds.includes(currentStep.id);
    const isTxSection = txStepIds.includes(currentStep.id);
    if (isOrderSection || isTxSection) {
      setIncludeDemoOrder(true);
    } else {
      setIncludeDemoOrder(false);
    }
  }, [isOnboarding, isActive, currentStep]);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        mode,
        currentStep,
        currentStepIndex,
        totalSteps,
        isOnboarding,
        isPageTutorial,
        nextStep,
        prevStep,
        finishTutorial,
        skipTutorial,
        startPageTutorial,
        triggerAdvance,
        includeDemoOrder,
        demoOrder,
        demoOrderProfile,
        demoTransaction,
        setDemoOrderAccepted,
        demoOrderAccepted,
        setTutorialTrackingAdded,
        setTutorialStatusChanged,
        setTutorialWithdrawalDone,
        setTutorialTermsAccepted,
        completeOnboarding,
      }}
    >
      {children}
      {isActive && currentStep && (
        <TutorialOverlay
          steps={steps}
          currentIndex={currentStepIndex}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTutorial}
          onClose={skipTutorial}
        />
      )}
      {showTermsModal && (
        <TermsModal
          onAccept={handleTermsAccept}
          onSkip={() => {
            setShowTermsModal(false);
            startOnboarding(savedStartIndex.current);
          }}
        />
      )}
    </TutorialContext.Provider>
  );
}
