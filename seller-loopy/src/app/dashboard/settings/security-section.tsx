import { useState } from "react";
import { Lock, Eye, EyeOff, Check, X, Info } from "lucide-react";
import toast from "react-hot-toast";

interface SecuritySectionProps {
  sellerId: number;
  infoTooltip: string | null;
  setInfoTooltip: (v: string | null) => void;
}

export default function SecuritySection({ sellerId, infoTooltip, setInfoTooltip }: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChanging(true);
    try {
      const res = await fetch("/api/sellers/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId, current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setChanging(false);
    }
  };

  const pwInputClass = "w-full bg-white border border-outline-variant/50 rounded-lg p-3 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all";

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-6 h-6 text-deep-navy" />
        <h3 className="text-title-lg text-deep-navy font-title-lg">Security</h3>
        <button onClick={() => setInfoTooltip(infoTooltip === "security" ? null : "security")} className="ml-auto p-1.5 text-on-surface-variant hover:text-deep-navy hover:bg-surface-blue rounded-lg transition-all">
          <Info className="w-4 h-4" />
        </button>
      </div>
      {infoTooltip === "security" && (
        <div className="mb-6 bg-surface-blue border border-outline-variant/30 rounded-lg p-4 text-sm text-on-surface-variant leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          Change your account password here. Use a strong, unique password to keep your seller account secure.
        </div>
      )}
      <form onSubmit={handleChangePassword} className="space-y-5">
        <div className="space-y-1">
          <label className="font-label-sm text-on-surface-variant">Current Password</label>
          <div className="relative">
            <input type={showCurrent ? "text" : "password"} value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className={pwInputClass} placeholder="••••••••" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-navy transition-colors">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-label-sm text-on-surface-variant ">New Password</label>
          <div className="relative">
            <input type={showNew ? "text" : "password"} value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={pwInputClass} placeholder="Enter new password" />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-navy transition-colors">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-label-sm text-on-surface-variant ">Confirm Password</label>
          <div className="relative">
            <input type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={pwInputClass} placeholder="Confirm new password" />
            {confirmPassword && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {confirmPassword === newPassword ? (
                  <Check className="w-4 h-4 text-status-success" />
                ) : (
                  <X className="w-4 h-4 text-status-error" />
                )}
              </div>
            )}
          </div>
        </div>
        <button type="submit" disabled={changing}
          className="w-full py-3 bg-surface-container-high text-deep-navy font-bold rounded-lg hover:bg-lavender-accent transition-all active:scale-95">
          {changing ? "Changing..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}
