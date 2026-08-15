import { Instagram, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, COMMUNITY_TAGLINE, COMMUNITY_DESCRIPTION } from '@/lib/config';

export function CommunityCard() {
  const [copied, setCopied] = useState(false);

  const handleShareWin = async () => {
    const shareText = 'I just earned influence points on NUDGEE! Turning positive peer pressure into real impact. #TwistedNotWasted';
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, title: 'My NUDGEE Win' });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(242,153,74,0.1), rgba(74,158,255,0.06))',
        border: '1px solid rgba(242,153,74,0.15)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #f2994a, #ec4899)' }}>
          <Instagram className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-white">{COMMUNITY_TAGLINE}</h3>
          <p className="text-[10px] text-white/40">Community Movement</p>
        </div>
      </div>
      <p className="text-xs text-white/50 leading-relaxed mb-4">{COMMUNITY_DESCRIPTION}</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #f2994a, #ec4899)', color: '#fff' }}
        >
          <Instagram className="h-3.5 w-3.5" />
          Follow @{INSTAGRAM_HANDLE}
        </a>
        <button
          onClick={handleShareWin}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', color: copied ? '#10b981' : 'rgba(255,255,255,0.7)' }}
        >
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Share2 className="h-3.5 w-3.5" /> Share your win</>}
        </button>
      </div>
    </div>
  );
}
