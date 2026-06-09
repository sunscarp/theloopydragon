"use client";
import { useState } from "react";
import {
  Mail, Phone, ExternalLink, Loader2, Send, Clock, Info,
  ShoppingCart, Wallet, ArrowRight,
} from "lucide-react";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus("sent");
        setName(""); setEmail(""); setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#22223B] font-[Montserrat]">Financial Support</h1>
        <p className="text-base text-[#47464d] mt-1">Get help with settlements, payouts, and billing</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-[#22223B]/5">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#22223B] font-[Montserrat]">Drop us a Message</h2>
              <p className="text-sm text-[#47464d] mt-1">We typically respond within 1-2 business days</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-semibold text-[#47464d] ml-1">Name</label>
                  <input id="name" type="text" value={name}
                    onChange={e => setName(e.target.value)} required
                    placeholder="Enter your full name"
                    className="bg-white border border-[#22223B]/10 rounded-lg px-4 py-3 text-sm text-[#121c2a] placeholder-[#78767e] focus:border-[#D7B3FB] focus:ring-2 focus:ring-[#D7B3FB] transition-all outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-semibold text-[#47464d] ml-1">Your email ID (to contact if needed)</label>
                  <input id="email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} required
                    placeholder="name@example.com"
                    className="bg-white border border-[#22223B]/10 rounded-lg px-4 py-3 text-sm text-[#121c2a] placeholder-[#78767e] focus:border-[#D7B3FB] focus:ring-2 focus:ring-[#D7B3FB] transition-all outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-semibold text-[#47464d] ml-1">Message</label>
                <textarea id="message" rows={5} value={message}
                  onChange={e => setMessage(e.target.value)} required
                  placeholder="Tell us how we can help with your financial inquiry..."
                  className="bg-white border border-[#22223B]/10 rounded-lg px-4 py-3 text-sm text-[#121c2a] placeholder-[#78767e] focus:border-[#D7B3FB] focus:ring-2 focus:ring-[#D7B3FB] transition-all outline-none resize-none" />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <button type="submit" disabled={status === "sending"}
                  className="bg-[#22223B] text-white text-xs font-semibold px-8 py-3 rounded-lg hover:scale-[1.01] active:opacity-80 transition-all shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {status === "sending" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Submit Message</>}
                </button>
                {status === "sent" && (
                  <p className="text-sm text-emerald-600">Message sent successfully! We&apos;ll get back to you within 1-2 business days.</p>
                )}
                {status === "error" && (
                  <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right - Contact Info */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-[#22223B]/5 h-full">
            <h3 className="text-xl font-bold text-[#22223B] font-[Montserrat] mb-6">Other ways to reach us</h3>
            <div className="space-y-6">
              <a href="mailto:theloopydragon123@gmail.com"
                className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-[#D7B3FB]/20 flex items-center justify-center text-[#22223B] group-hover:bg-[#D7B3FB] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#47464d]">Email</p>
                  <p className="text-sm font-semibold text-[#22223B]">theloopydragon123@gmail.com</p>
                </div>
              </a>
              <a href="https://wa.me/919307502865" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#47464d]">WhatsApp</p>
                  <p className="text-sm font-semibold text-[#22223B]">+91 9307502865</p>
                </div>
              </a>
              <a href="https://instagram.com/theloopydragon" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-[#d9b5fd]/30 flex items-center justify-center text-[#705091] group-hover:bg-[#705091] group-hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#47464d]">Instagram</p>
                  <p className="text-sm font-semibold text-[#22223B]">@theloopydragon</p>
                </div>
              </a>
            </div>

            <div className="mt-12 p-5 bg-[#eff4ff] rounded-lg border border-[#22223B]/5">
              <div className="flex items-center gap-2 mb-2 text-[#22223B]">
                <Info className="w-4 h-4" />
                <h4 className="text-xs font-semibold">Response Time</h4>
              </div>
              <p className="text-xs text-[#47464d] leading-relaxed">
                We aim to respond to all support inquiries within 1-2 business days. For urgent matters, reach out via WhatsApp for faster assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Processing */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#22223B] font-[Montserrat]">Transaction Processing</h2>
          <p className="text-sm text-[#47464d] mt-1">Understanding your payout lifecycle</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-[#22223B]/5 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 p-2 opacity-5 text-8xl font-bold text-[#22223B] select-none">1</div>
            <div className="w-10 h-10 rounded-lg bg-[#d9e3f6] flex items-center justify-center text-[#22223B] mb-4">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-[#22223B] mb-3">Order Placed</h4>
            <p className="text-sm text-[#47464d] leading-relaxed">
              When a customer purchases your product, the amount is recorded and enters a 2 business day clearing period.
            </p>
            <div className="mt-5 h-1 w-full bg-[#d9e3f6] rounded-full overflow-hidden">
              <div className="h-full bg-[#D7B3FB] w-1/3 group-hover:w-full transition-all duration-700"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#22223B]/5 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 p-2 opacity-5 text-8xl font-bold text-[#22223B] select-none">2</div>
            <div className="w-10 h-10 rounded-lg bg-[#d9e3f6] flex items-center justify-center text-[#22223B] mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-[#22223B] mb-3">Cleared for Withdrawal</h4>
            <p className="text-sm text-[#47464d] leading-relaxed">
              After 2 business days, the amount moves from &apos;In Clearing&apos; to &apos;Available&apos; balance for withdrawal.
            </p>
            <div className="mt-5 h-1 w-full bg-[#d9e3f6] rounded-full overflow-hidden">
              <div className="h-full bg-[#D7B3FB] w-2/3 group-hover:w-full transition-all duration-700"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#22223B]/5 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 p-2 opacity-5 text-8xl font-bold text-[#22223B] select-none">3</div>
            <div className="w-10 h-10 rounded-lg bg-[#d9e3f6] flex items-center justify-center text-[#22223B] mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-[#22223B] mb-3">Payout Sent</h4>
            <p className="text-sm text-[#47464d] leading-relaxed">
              The owner reviews and processes your withdrawal via UPI within 2 days. A UPI transaction ID is provided for tracking.
            </p>
            <div className="mt-5 h-1 w-full bg-[#d9e3f6] rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Area */}
      <div className="rounded-2xl h-48 bg-gradient-to-r from-[#22223B] to-[#705091] relative overflow-hidden flex items-center px-10">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect fill="url(#grid)" width="100%" height="100%" />
          </svg>
        </div>
        <div className="relative z-10 max-w-xl">
          <h3 className="text-lg font-bold text-white mb-1">Need a Payout History Export?</h3>
          <p className="text-sm text-white/80">You can download your complete financial ledger from the Financials tab for tax purposes.</p>
        </div>
        <div className="ml-auto relative z-10 hidden md:block">
          <button className="bg-white text-[#22223B] px-6 py-3 rounded-lg text-xs font-semibold hover:bg-[#D7B3FB] transition-colors shadow-xl">
            Visit Financials
          </button>
        </div>
      </div>


    </div>
  );
}
