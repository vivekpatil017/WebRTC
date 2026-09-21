import React, { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { ChevronDown, X } from 'lucide-react';

export interface VoiceUser {
  id: string;
  name: string;
  img?: string;
  active?: boolean;
}

interface VoiceChatDisclosureProps {
  users?: VoiceUser[];
  title?: string;
}

function getAvatarColor(name: string) {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#06b6d4',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ user, size = 48, showBorder = true }: { user: VoiceUser; size?: number; showBorder?: boolean }) {
  const color = getAvatarColor(user.name);
  const initials = user.name.slice(0, 2).toUpperCase();

  if (user.img) {
    return (
      <img
        src={user.img}
        alt={user.name}
        style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
          border: showBorder ? '3px solid rgba(10,14,22,1)' : 'none',
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}dd, ${color}77)`,
      border: showBorder ? '3px solid rgba(10,14,22,1)' : `2px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, color: '#fff',
    }}>
      {initials}
    </div>
  );
}

const SoundBars = ({ small = false, color = '#fff' }: { small?: boolean; color?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: small ? 1.5 : 2.5 }}>
    {[0, 1, 2, 3].map(i => (
      <motion.div
        key={i}
        style={{ width: small ? 1.5 : 2.5, borderRadius: 99, background: color }}
        initial={{ height: small ? 3 : 5 }}
        animate={{ height: small ? [2, 9, 4] : [2, 15, 6] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

export const VoiceChatDisclosure: React.FC<VoiceChatDisclosureProps> = ({
  users = [],
  title = 'Participants',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const visibleUsers = users.slice(0, 4);
  const extra = users.length - 4;

  return (
    <MotionConfig transition={{ type: 'spring', bounce: 0, visualDuration: 0.3 }}>
      <motion.div layout style={{ position: 'relative', paddingTop: 14, paddingLeft: 14 }}>

        {/* Animated sound-bars orb (visible when collapsed) */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              key="orb"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{
                position: 'absolute', top: 0, left: 0, zIndex: 20,
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}
            >
              <SoundBars />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main floating card */}
        <motion.div
          layout
          onClick={() => !isOpen && setIsOpen(true)}
          style={{
            cursor: isOpen ? 'default' : 'pointer',
            overflow: 'hidden',
            background: 'rgba(8, 11, 20, 0.92)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
            width: isOpen ? 'min(290px, calc(100vw - 48px))' : 252,
            borderRadius: isOpen ? 20 : 40,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!isOpen ? (
              /* ── Collapsed pill ── */
              <motion.div
                key="pill"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  height: 52, display: 'flex', alignItems: 'center',
                  padding: '0 16px', gap: 8,
                }}
              >
                <div style={{ display: 'flex' }}>
                  {visibleUsers.map((user, idx) => (
                    <div
                      key={user.id}
                      style={{ zIndex: 10 - idx, marginLeft: idx === 0 ? 0 : -10 }}
                    >
                      <Avatar user={user} size={34} showBorder />
                    </div>
                  ))}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600,
                }}>
                  {extra > 0 && <span>+{extra}</span>}
                  <ChevronDown size={15} />
                </div>
              </motion.div>
            ) : (
              /* ── Expanded panel ── */
              <motion.div
                key="panel"
                layout
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {/* Panel header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.025)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <SoundBars small color="rgba(255,255,255,0.7)" />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: '0.01em' }}>
                      {title}
                    </span>
                    <span style={{
                      background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
                      fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}>
                      {users.length}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setIsOpen(false); }}
                    style={{
                      background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
                      borderRadius: '50%', width: 26, height: 26,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.55)', flexShrink: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Participant grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '14px 6px', padding: '14px',
                }}>
                  {users.map(user => (
                    <div
                      key={user.id}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Avatar user={user} size={46} showBorder={false} />
                        {user.active && (
                          <div style={{
                            position: 'absolute', top: -3, right: -3,
                            width: 18, height: 18, borderRadius: '50%',
                            background: 'rgba(8,11,20,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{ display: 'flex', gap: 1 }}>
                              {[0, 1, 2].map(i => (
                                <motion.div
                                  key={i}
                                  style={{ width: 1.5, borderRadius: 99, background: '#4ade80' }}
                                  animate={{ height: [2, 7, 3] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span style={{
                        color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: 600,
                        textAlign: 'center', width: '100%',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        letterSpacing: '0.02em',
                      }}>
                        {user.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
};
