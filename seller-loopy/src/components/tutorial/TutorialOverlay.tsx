"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, SkipForward, HelpCircle } from "lucide-react";
import type { TutorialStep } from "@/lib/tutorials";

interface TutorialOverlayProps {
  steps: TutorialStep[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
  onPerformAction?: () => void;
}

export default function TutorialOverlay({
  steps,
  currentIndex,
  onNext,
  onPrev,
  onSkip,
  onClose,
  onPerformAction,
}: TutorialOverlayProps) {
  const step = steps[currentIndex];
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isLast = currentIndex === steps.length - 1;
  const isFirst = currentIndex === 0;
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const updatePosition = useCallback(() => {
    if (step?.targetSelector && step.placement !== "center") {
      const el = document.querySelector(step.targetSelector) as HTMLElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < window.innerWidth;
        if (!isVisible) {
          setTargetRect(null);
          return;
        }
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    let rafId: number;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      observer.disconnect();
    };
  }, [updatePosition]);

  useEffect(() => {
    if (step?.targetSelector && step.placement !== "center") {
      const el = document.querySelector(step.targetSelector) as HTMLElement;
      if (el) {
        const getScrollParent = (node: HTMLElement): HTMLElement => {
          let parent = node.parentElement;
          while (parent) {
            const { overflowY } = window.getComputedStyle(parent);
            if ((overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight) {
              return parent;
            }
            parent = parent.parentElement;
          }
          return document.documentElement;
        };
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < window.innerWidth;
        if (!isVisible) {
          setTargetRect(null);
          return;
        }
        const headerOffset = 64;
        const inView = rect.top >= headerOffset && rect.bottom <= window.innerHeight;
        if (!inView) {
          const scrollParent = getScrollParent(el);
          if (scrollParent === document.documentElement) {
            el.scrollIntoView({ behavior: "instant", block: "center" });
            document.documentElement.scrollBy(0, -headerOffset / 2);
          } else {
            const parentRect = scrollParent.getBoundingClientRect();
            const elTop = el.getBoundingClientRect().top - parentRect.top + scrollParent.scrollTop;
            scrollParent.scrollTo({
              top: elTop - scrollParent.clientHeight / 2 + el.offsetHeight / 2,
              behavior: "instant",
            });
          }
          requestAnimationFrame(() => {
            const newRect = el.getBoundingClientRect();
            setTargetRect(newRect);
          });
        } else {
          setTargetRect(rect);
        }
        return;
      }
    }
    setTargetRect(null);
  }, [step]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (step && tooltipRef.current) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight" || e.key === "Enter") {
          if (step.actionRequired) onPerformAction?.();
          else onNext();
        }
        if (e.key === "ArrowLeft") onPrev();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [step, onNext, onPrev, onClose]);

  if (!step) return null;

  const tooltipWidth = step.mockup === "stats" ? Math.min(780, window.innerWidth - 32) : step.mockup ? Math.min(480, window.innerWidth - 32) : Math.min(320, window.innerWidth - 32);
  const tooltipStyle: React.CSSProperties = {};
  let tooltipClasses = "fixed z-[10010]";
  if (step.mockup === "stats") {
    tooltipClasses += " w-[780px] max-w-[calc(100vw-2rem)]";
  } else if (step.mockup) {
    tooltipClasses += " w-[480px] max-w-[calc(100vw-2rem)]";
  } else {
    tooltipClasses += " w-80 max-w-[calc(100vw-2rem)]";
  }
  let arrowClasses = "absolute w-3 h-3 bg-white rotate-45";

  if (step.placement === "center" || !targetRect || isSmallScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-4 sm:p-8 relative animate-in fade-in zoom-in duration-200">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{step.description}</p>
          </div>
          {step.mockup === "add" && (
            <div className="mb-4 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-sm font-bold text-gray-900">Add New Product</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Product Name</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">Handcrafted Macrame Keychain</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Price (₹)</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">299</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Quantity</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">50</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Weight (g)</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">25</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Material</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">Cotton cord, wooden beads</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Tags</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">Keychains, Macrame, Handmade</div>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <div className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg opacity-60">Add Product</div>
              </div>
            </div>
          )}
          {step.mockup === "edit" && (
            <div className="mb-4 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-[#22223B] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <span className="text-sm font-bold text-gray-900">Edit Product</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Product Name</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">Handcrafted Macrame Keychain</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Price (₹)</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-amber-300 bg-amber-50">349</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Quantity</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">50</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-400 uppercase mb-1">Description</div>
                  <div className="text-xs text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200">A beautiful handcrafted macrame keychain...</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <div className="px-4 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg opacity-60">Cancel</div>
                <div className="px-4 py-1.5 text-xs font-medium text-white bg-[#22223B] rounded-lg opacity-60">Save Changes</div>
              </div>
            </div>
          )}
          {step.mockup === "stats" && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Products Listed</div>
                <div className="text-lg font-bold text-gray-900">0</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Total items in your catalog. Click "Manage Products" on the card to go directly to your product catalog.</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Items Sold</div>
                <div className="text-lg font-bold text-gray-900">0</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Unique customer orders accepted and fulfilled. Each customer order counts as one.</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total Revenue</div>
                <div className="text-lg font-bold text-gray-900">₹0.00</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Your total earnings from all accepted orders, including item prices and shipping. The sparkline chart shows your trend.</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Pending Payout</div>
                <div className="text-lg font-bold text-gray-900">₹0.00</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Amount available after deducting paid withdrawals and penalties. Request withdrawals from the Transactions page.</div>
              </div>
            </div>
          )}
          {step.mockup === "delete" && (
            <div className="mb-4 bg-red-50 rounded-xl border border-red-200 p-5 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Delete Product</h4>
              <p className="text-xs text-gray-600 mb-4">Are you sure you want to delete <span className="font-semibold">&ldquo;Handcrafted Macrame Keychain&rdquo;</span>?</p>
              <div className="flex justify-center gap-3">
                <div className="px-4 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg opacity-60">Cancel</div>
                <div className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg opacity-60">Delete</div>
              </div>
            </div>
          )}
          {step.mockup === "withdraw" && (
            <div className="mb-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-xs font-bold text-gray-700">Withdrawals &amp; Penalties</span>
                </div>
              </div>
              <div className="p-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-[10px] font-medium text-gray-500 uppercase">Amount</span>
                    <span className="text-[10px] font-medium text-gray-500 uppercase">Status</span>
                    <span className="text-[10px] font-medium text-gray-500 uppercase text-right">Date</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-3 gap-2 px-3 py-2.5 items-center">
                      <span className="text-xs font-medium text-gray-900">₹250.00</span>
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit">Pending</span>
                      <span className="text-xs text-gray-400 text-right">Just now</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 px-3 py-2.5 items-center">
                      <span className="text-xs font-medium text-gray-400">₹50.00</span>
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit">Rejected</span>
                      <span className="text-xs text-gray-400 text-right">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button onClick={onSkip}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <SkipForward className="w-3 h-3" />
                Skip
              </button>
              <div className="flex items-center gap-1.5">
                {!isFirst && (
                  <button onClick={onPrev}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {!isLast && (
                  <button onClick={() => { if (step.actionRequired) onPerformAction?.(); else onNext(); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {isLast && (
                  <button onClick={onNext}
                    className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                    Finish
                  </button>
                )}
              </div>
            </div>
        </div>
      </div>
    );
  }

  const halfWidth = tooltipWidth / 2;
  const maxLeft = window.innerWidth - tooltipWidth - 16;
  switch (step.placement) {
    case "top":
      tooltipStyle.left = Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - halfWidth, maxLeft));
      tooltipStyle.top = Math.max(16, targetRect.top - 12);
      tooltipClasses += " -translate-y-full";
      arrowClasses += " border-r border-b border-gray-200";
      break;
    case "bottom":
      tooltipStyle.left = Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - halfWidth, maxLeft));
      tooltipStyle.top = targetRect.bottom + 24;
      tooltipClasses += " translate-y-0";
      arrowClasses += " border-l border-t border-gray-200";
      break;
    case "left":
      tooltipStyle.left = Math.max(16, targetRect.left - tooltipWidth - 24);
      tooltipStyle.top = Math.max(16, targetRect.top + targetRect.height / 2 - 80);
      tooltipClasses += "";
      break;
    case "right":
      tooltipStyle.left = targetRect.right + 24;
      tooltipStyle.top = Math.max(16, targetRect.top + targetRect.height / 2 - 80);
      tooltipClasses += "";
      break;
  }

  tooltipStyle.left = Math.max(16, Math.min(Number(tooltipStyle.left ?? 0), window.innerWidth - tooltipWidth - 16));
  tooltipStyle.top = Math.max(16, Math.min(Number(tooltipStyle.top ?? 0), window.innerHeight - 250));

  return (
    <>
      {/* Backdrop - single cutout with massive outline to avoid seam lines between panels */}
      <div
        className="fixed z-[9999] pointer-events-auto"
        style={{
          top: Math.max(0, targetRect.top - 8),
          left: Math.max(0, targetRect.left - 8),
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          borderRadius: 12,
          outline: "9999px solid rgba(0,0,0,0.6)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={tooltipClasses}
        style={tooltipStyle}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-5 relative z-[10010]">
          <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="mb-3 pr-6">
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{step.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{step.description}</p>
          </div>
          {step.mockup === "stats" && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Products Listed</div>
                <div className="text-lg font-bold text-gray-900">0</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Total items in your catalog. Click "Manage Products" on the card to go directly to your product catalog.</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Items Sold</div>
                <div className="text-lg font-bold text-gray-900">0</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Unique customer orders accepted and fulfilled. Each customer order counts as one.</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total Revenue</div>
                <div className="text-lg font-bold text-gray-900">₹0.00</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Your total earnings from all accepted orders, including item prices and shipping. The sparkline chart shows your trend.</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Pending Payout</div>
                <div className="text-lg font-bold text-gray-900">₹0.00</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Amount available after deducting paid withdrawals and penalties. Request withdrawals from the Transactions page.</div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button onClick={onSkip}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
              Skip
            </button>
            <div className="flex items-center gap-1.5">
              {!isFirst && (
                <button onClick={onPrev}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              {!isLast && (
                <button onClick={() => { if (step.actionRequired) onPerformAction?.(); else onNext(); }}
                  className="flex items-center gap-0.5 px-2.5 py-1 text-[10px] font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {isLast && (
                <button onClick={onNext}
                  className="px-3 py-1 text-[10px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function TutorialHelpButton({ onClick }: { onClick: () => void }) {
  const [isPhone, setIsPhone] = useState(true);

  useEffect(() => {
    const check = () => setIsPhone(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isPhone) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center"
      title="Page tutorial"
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );
}
