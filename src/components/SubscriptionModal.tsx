import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Shield, Crown, Flame, Award, ArrowRight, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { SubscriptionTier, SubscriptionInfo } from '../types';
import { fireResolvedConfetti } from '../utils/aiHelpers';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionInfo;
  onUpdateSubscription: (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly') => void;
  uiLang?: 'tn' | 'en';
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  uiLang = 'en',
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(subscription.billingCycle || 'monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(subscription.tier);
  const [justUpgraded, setJustUpgraded] = useState(false);

  if (!isOpen) return null;

  const isTn = uiLang === 'tn';

  const handleSelectTier = (tier: SubscriptionTier) => {
    onUpdateSubscription(tier, billingCycle);
    setSelectedTier(tier);
    setJustUpgraded(true);
    fireResolvedConfetti();
    setTimeout(() => {
      setJustUpgraded(false);
      onClose();
    }, 1200);
  };

  const tiers = [
    {
      id: 'free' as SubscriptionTier,
      name: isTn ? 'لاعب هاوي (Free)' : 'Gamer Free',
      tagline: isTn ? 'التشخيص الأساسي للأعطال ومشاكل الـ FPS' : 'Essential PC troubleshooting and error diagnostic lookup.',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      period: '/month',
      icon: Shield,
      accentColor: 'border-slate-700 bg-slate-900/40 text-slate-300',
      badge: null,
      buttonText: subscription.tier === 'free' ? (isTn ? 'خطتك الحالية' : 'Current Active Plan') : (isTn ? 'الرجوع للـ Free' : 'Downgrade to Free'),
      buttonClass: subscription.tier === 'free' ? 'bg-zinc-800 text-slate-400 cursor-default' : 'bg-white/10 hover:bg-white/20 text-white',
      features: [
        isTn ? 'محرك تشخيص الألعاب الأساسي' : 'Standard GameFix AI Diagnostic Engine',
        isTn ? 'قاعدة بيانات أخطاء DirectX و DLL' : 'Access to Community Error & DLL Database',
        isTn ? 'فحص يدوي لتعريفات الكارت غرافيك' : 'Manual GPU Driver WHQL Checker',
        isTn ? 'حساب البينغ والـ Jitter الأساسي' : 'Standard Edge Ping & Jitter Network Probes',
        isTn ? 'تصدير حلول الـ PDF القياسية' : 'Standard PDF Troubleshooting Export',
      ],
      notIncluded: [
        isTn ? 'توليد أوتوماتيكي لملفات Config و Autoexec' : 'Automated Custom Autoexec / Config Generator',
        isTn ? 'تخطي حظر إعلانات الـ VIP' : 'Zero Banner Ads / VIP Cockpit Experience',
        isTn ? 'تحليل كراش Logs المتقدم للشركات والفرق' : 'Esports Multi-PC LAN Telemetry Profiling',
      ],
    },
    {
      id: 'pro' as SubscriptionTier,
      name: isTn ? 'برو تونر (Pro Tuner)' : 'Pro Tuner',
      tagline: isTn ? 'الأداء الأقصى مع أول أولوية واستجابة فائقة السرعة' : 'Maximum FPS, zero input lag, and automated configuration engines.',
      monthlyPrice: '$4.99',
      yearlyPrice: '$3.99',
      yearlyBilledTotal: '$47.88/yr',
      period: '/month',
      icon: Zap,
      accentColor: 'border-green-500/60 bg-green-950/20 text-green-300 shadow-[0_0_25px_rgba(34,197,94,0.15)]',
      badge: isTn ? 'الأكثر طلباً ⚡' : 'MOST POPULAR ⚡',
      buttonText: subscription.tier === 'pro' ? (isTn ? 'خطتك الحالية (Pro Active)' : 'Active Plan (Pro Tuner)') : (isTn ? 'ترقية إلى Pro Tuner' : 'Upgrade to Pro Tuner'),
      buttonClass: subscription.tier === 'pro' ? 'bg-green-500/20 text-green-400 border border-green-500/40 cursor-default' : 'bg-green-500 hover:bg-green-400 text-black font-extrabold shadow-[0_0_15px_rgba(34,197,94,0.4)]',
      features: [
        isTn ? 'سرعة فائقة وأولوية قصوى لمحرك الذكاء الاصطناعي' : 'Ultra-Fast Dedicated AI Diagnostic Compute',
        isTn ? 'توليد تلقائي لملفات Engine.ini و Launch Arguments' : '1-Click Engine.ini & Launch Argument Optimizer',
        isTn ? 'مراقب فوري ومستمر لتعريفات GPU و الثغرات' : 'Automated GPU Driver Vulnerability & WHQL Monitor',
        isTn ? 'تصدير غير محدود لتقارير PDF Offline Runbook' : 'Unlimited Branded PDF Offline Crash Runbooks',
        isTn ? 'تجربة VIP بدون أي إعلانات' : '100% Ad-Free Clean Esports Cockpit',
        isTn ? 'تجاوز أخطاء Vanguard و EasyAntiCheat وحلول Kernel' : 'Kernel Anti-Cheat (EAC/Vanguard) VIP Sandbox Fixes',
        isTn ? 'دعم خاص في Discord و Badge مميز' : 'VIP Discord Role & Priority Support',
      ],
      notIncluded: [
        isTn ? 'فحص شبكات LAN لفرق الـ Esports والشركات' : 'Multi-Rig LAN & Esports Team Profiling',
      ],
    },
    {
      id: 'esports' as SubscriptionTier,
      name: isTn ? 'إيسبورتس & استوديو (Esports/Studio)' : 'Esports & Studio',
      tagline: isTn ? 'لصناع الألعاب، مقاهي الجيمينغ، وفرق الرياضات الإلكترونية' : 'Built for game developers, tournament teams, and LAN centers.',
      monthlyPrice: '$14.99',
      yearlyPrice: '$11.99',
      yearlyBilledTotal: '$143.88/yr',
      period: '/month',
      icon: Crown,
      accentColor: 'border-indigo-500/60 bg-indigo-950/20 text-indigo-300 shadow-[0_0_25px_rgba(99,102,241,0.15)]',
      badge: isTn ? 'للفرق والمطورين 🏆' : 'ESPORTS & TEAMS 🏆',
      buttonText: subscription.tier === 'esports' ? (isTn ? 'خطتك الحالية (Esports Active)' : 'Active Plan (Esports)') : (isTn ? 'ترقية إلى Esports & Studio' : 'Get Esports & Studio'),
      buttonClass: subscription.tier === 'esports' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-[0_0_15px_rgba(99,102,241,0.4)]',
      features: [
        isTn ? 'كل ميزات Pro Tuner مدمجة بالكامل' : 'Everything in Pro Tuner Included',
        isTn ? 'فحص وتتبع أداء حتى 15 جهاز PC في نفس الوقت' : 'Multi-Rig Profiling (Up to 15 PCs simultaneously)',
        isTn ? 'مولد عروض المستثمرين وسكربتات التيك توك لمطوري الألعاب' : 'Game Pitch Deck & Viral Video Script Generator',
        isTn ? 'فحص مسار الباكت وعقد الخوادم بأقل من 1ms' : 'Dedicated Sub-1ms Routing Node Tracer',
        isTn ? 'تصدير شامل لتقارير بطولات الـ LAN وتتبع الـ FPS' : 'Custom Team Latency & Frame Pacing Analytics',
        isTn ? 'وصول مبكر ومباشر لمهندسي النظام' : 'Direct 1-on-1 Hardware Tuning Consultations',
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-[#090d1e] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Glow Banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-green-500 to-indigo-500" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  GameFix AI <span className="text-green-400">Membership Tiers</span>
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold bg-green-500/10 border border-green-500/30 text-green-400 rounded">
                  {isTn ? 'إلغاء في أي وقت' : 'CANCEL ANYTIME'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTn 
                  ? 'اختر الخطة المناسبة لجهازك وتمتع بأقصى عدد فريمات، حلول أوتوماتيكية، وتشخيص حصري بدون إعلانات.'
                  : 'Supercharge your gaming rig with dedicated low-latency AI compute, automated engine tuners, and VIP perks.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="px-4 sm:px-6 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex p-1 bg-black/60 border border-white/10 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                billingCycle === 'monthly'
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isTn ? 'اشتراك شهري (Monthly)' : 'Monthly Billing'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-green-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{isTn ? 'اشتراك سنوي (Yearly)' : 'Annual Billing'}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${billingCycle === 'yearly' ? 'bg-black text-green-400' : 'bg-green-500/20 text-green-400'}`}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Tier Cards Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const Icon = t.icon;
            const isCurrent = subscription.tier === t.id;
            const price = billingCycle === 'yearly' ? t.yearlyPrice : t.monthlyPrice;

            return (
              <div
                key={t.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                  t.accentColor
                } ${isCurrent ? 'ring-2 ring-green-400/50' : 'hover:scale-[1.01]'}`}
              >
                {/* Optional Badge */}
                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-cyan-400 text-black font-black text-[10px] uppercase tracking-wider shadow-lg">
                    {t.badge}
                  </div>
                )}

                <div>
                  {/* Tier Title */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-current" />
                      <h3 className="font-black text-base uppercase text-white">{t.name}</h3>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-green-500/20 border border-green-500/40 text-green-400 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-4 min-h-[32px] leading-snug">{t.tagline}</p>

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono">{price}</span>
                      <span className="text-xs font-mono text-slate-400">{t.period}</span>
                    </div>
                    {billingCycle === 'yearly' && t.yearlyBilledTotal && (
                      <div className="text-[10px] text-green-400 font-mono mt-0.5">
                        Billed annually at {t.yearlyBilledTotal}
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {isTn ? 'الميزات المضمنة:' : 'What\'s Included:'}
                    </div>
                    {t.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </div>
                    ))}

                    {t.notIncluded.length > 0 && (
                      <div className="pt-2 space-y-1.5 opacity-40">
                        {t.notIncluded.map((nf, nfIdx) => (
                          <div key={nfIdx} className="flex items-start gap-2 text-xs text-slate-400 line-through">
                            <X className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span className="leading-tight">{nf}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upgrade Button */}
                <div>
                  <button
                    onClick={() => handleSelectTier(t.id)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition flex items-center justify-center gap-2 ${
                      t.buttonClass
                    }`}
                  >
                    <span>{t.buttonText}</span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Guarantee Footer */}
        <div className="p-4 sm:p-5 bg-black/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>30-Day Zero-Risk Guarantee</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instant VIP Activation</span>
            </div>
          </div>

          <div className="text-slate-500 text-[10px]">
            Encrypted Checkout • Automatic Updates • No Hardware Lock
          </div>
        </div>
      </div>
    </div>
  );
};
