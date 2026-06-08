// utils/deviceDetection.ts
"use client";

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile device patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Opera Mini/i,
    /IEMobile/i,
    /Mobile/i
  ];
  
  const isMobileUA = mobilePatterns.some(pattern => userAgent.match(pattern));
  
  // Check screen size as backup
  const isMobileScreen = window.innerWidth <= 768;
  
  return isMobileUA || isMobileScreen;
};

export const redirectToMobile = () => {
  if (typeof window !== 'undefined' && isMobileDevice()) {
    window.location.href = '/HomeMobile';
  }
};

export const redirectToDesktop = () => {
  if (typeof window !== 'undefined' && !isMobileDevice()) {
    window.location.href = '/';
  }
};