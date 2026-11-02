'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Plus,
  Search,
  Sparkles,
  Layers,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils/cn';

type SimMode = 'btree' | 'clock' | 'hashring';

/* --- B+ TREE SIMULATOR DATA --- */
interface BTreeNode {
  id: string;
  keys: number[];
  isLeaf: boolean;
  children?: BTreeNode[];
}

const INITIAL_BTREE: BTreeNode = {
  id: 'root',
  keys: [25, 60],
  isLeaf: false,
  children: [
    { id: 'leaf-1', keys: [5, 12, 18], isLeaf: true },
    { id: 'leaf-2', keys: [30, 45], isLeaf: true },
    { id: 'leaf-3', keys: [70, 85], isLeaf: true }
  ]
};

/* --- CLOCK FRAME DATA --- */
interface BufferFrame {
  id: number;
  pageId: number | null;
  refBit: 0 | 1;
  pinned: boolean;
  isDirty: boolean;
}

const INITIAL_FRAMES: BufferFrame[] = [
  { id: 0, pageId: 104, refBit: 1, pinned: false, isDirty: true },
  { id: 1, pageId: 218, refBit: 1, pinned: true, isDirty: false },
  { id: 2, pageId: 309, refBit: 0, pinned: false, isDirty: true },
  { id: 3, pageId: 442, refBit: 1, pinned: false, isDirty: false },
  { id: 4, pageId: 512, refBit: 0, pinned: false, isDirty: false }
];

/* --- CONSISTENT HASH DATA --- */
interface RingNode {
  name: string;
  angle: number;
  color: string;
}

const INITIAL_RING_NODES: RingNode[] = [
  { name: 'Node-A', angle: 45, color: '#0284c7' },
  { name: 'Node-B', angle: 165, color: '#10b981' },
  { name: 'Node-C', angle: 285, color: '#8b5cf6' }
];

export function DatabasePlayground() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<SimMode>('btree');

  /* B-TREE STATE */
  const [tree, setTree] = useState<BTreeNode>(INITIAL_BTREE);
  const [inputKey, setInputKey] = useState<string>('20');
  const [searchTarget, setSearchTarget] = useState<number | null>(null);
  const [activePath, setActivePath] = useState<string[]>([]);
  const [splitNotice, setSplitNotice] = useState<string | null>(null);

  /* CLOCK STATE */
  const [frames, setFrames] = useState<BufferFrame[]>(INITIAL_FRAMES);
  const [clockPointer, setClockPointer] = useState<number>(0);
  const [clockLog, setClockLog] = useState<string>('System initialized. All 5 memory frames mounted.');

  /* HASH RING STATE */
  const [ringNodes, setRingNodes] = useState<RingNode[]>(INITIAL_RING_NODES);
  const [keyHashAngle, setKeyHashAngle] = useState<number>(110);
  const [selectedRingServer, setSelectedRingServer] = useState<string>('Node-B');

  // Handle B-Tree insert
  const handleInsertKey = () => {
    const val = parseInt(inputKey, 10);
    if (isNaN(val)) return;

    setSearchTarget(val);
    setActivePath(['root']);

    // Find which leaf
    const newTree = JSON.parse(JSON.stringify(tree)) as BTreeNode;
    let targetLeaf: BTreeNode = newTree.children![0];
    if (val < newTree.keys[0]) {
      targetLeaf = newTree.children![0];
      setActivePath(['root', newTree.children![0].id]);
    } else if (newTree.keys.length > 1 && val < newTree.keys[1]) {
      targetLeaf = newTree.children![1];
      setActivePath(['root', newTree.children![1].id]);
    } else {
      targetLeaf = newTree.children![newTree.children!.length - 1];
      setActivePath(['root', targetLeaf.id]);
    }

    if (!targetLeaf.keys.includes(val)) {
      targetLeaf.keys.push(val);
      targetLeaf.keys.sort((a, b) => a - b);
    }

    // Check if overflow > 3
    if (targetLeaf.keys.length > 3) {
      setSplitNotice(
        locale === 'vi'
          ? `Trang ${targetLeaf.id} vượt quá MAX_KEYS (4 > 3). Đang kích hoạt tách 50/50 và đẩy khóa giữa lên trang Root!`
          : `Page ${targetLeaf.id} overflowed capacity (4 > 3). Triggered 50/50 split and promoted median key to Root!`
      );
      // Simulate split
      const mid = targetLeaf.keys[2];
      const leftKeys = targetLeaf.keys.slice(0, 2);
      const rightKeys = targetLeaf.keys.slice(2);
      targetLeaf.keys = leftKeys;
      const rightNode: BTreeNode = {
        id: `leaf-split-${Date.now().toString().slice(-3)}`,
        keys: rightKeys,
        isLeaf: true
      };
      newTree.keys.push(mid);
      newTree.keys.sort((a, b) => a - b);
      newTree.children!.push(rightNode);
    } else {
      setSplitNotice(
        locale === 'vi'
          ? `Đã chèn khóa ${val} vào trang ${targetLeaf.id}. Trang còn chỗ trống, không cần tách.`
          : `Inserted key ${val} into page ${targetLeaf.id}. Page capacity intact, split not required.`
      );
    }

    setTree(newTree);
    setInputKey(String(Math.floor(Math.random() * 90) + 10));
  };

  const handleResetBTree = () => {
    setTree(INITIAL_BTREE);
    setActivePath([]);
    setSearchTarget(null);
    setSplitNotice(null);
  };

  // Clock evict step
  const handleClockStep = () => {
    const newFrames = [...frames];
    let ptr = clockPointer;
    let foundVictim = false;
    let victimId = -1;

    for (let attempts = 0; attempts < newFrames.length * 2; attempts++) {
      const f = newFrames[ptr];
      if (f.pinned) {
        ptr = (ptr + 1) % newFrames.length;
        continue;
      }

      if (f.refBit === 1) {
        // Second chance: reset bit to 0 and advance
        newFrames[ptr] = { ...f, refBit: 0 };
        ptr = (ptr + 1) % newFrames.length;
      } else {
        // Victim found!
        foundVictim = true;
        victimId = f.id;
        const newPageId = Math.floor(Math.random() * 800) + 100;
        const wasDirty = f.isDirty;
        newFrames[ptr] = {
          ...f,
          pageId: newPageId,
          refBit: 1,
          isDirty: false
        };
        ptr = (ptr + 1) % newFrames.length;
        setClockLog(
          locale === 'vi'
            ? `Clock Hand chọn Frame #${victimId} (ref=0, unpinned). ${
                wasDirty ? 'Ghi trang bẩn cũ xuống đĩa (fsync)... ' : ''
              }Tải trang mới #${newPageId} vào Frame #${victimId}.`
            : `Clock hand selected victim Frame #${victimId} (ref=0, unpinned). ${
                wasDirty ? 'Flushed dirty victim to disk... ' : ''
              }Loaded new page #${newPageId} into Frame #${victimId}.`
        );
        break;
      }
    }

    setFrames(newFrames);
    setClockPointer(ptr);
  };

  // Hash ring search
  const handleRingKeyChange = (val: number) => {
    setKeyHashAngle(val);
    // Find next node clockwise
    const sorted = [...ringNodes].sort((a, b) => a.angle - b.angle);
    let target = sorted[0].name;
    for (const n of sorted) {
      if (n.angle >= val) {
        target = n.name;
        break;
      }
    }
    setSelectedRingServer(target);
  };

  const handleAddRingNode = () => {
    if (ringNodes.length >= 6) return;
    const newAngle = (ringNodes[ringNodes.length - 1].angle + 75) % 360;
    const name = `Node-${String.fromCharCode(65 + ringNodes.length)}`;
    const color = ringNodes.length % 2 === 0 ? '#ec4899' : '#06b6d4';
    const updated = [...ringNodes, { name, angle: newAngle, color }].sort((a, b) => a.angle - b.angle);
    setRingNodes(updated);
    handleRingKeyChange(keyHashAngle);
  };

  return (
    <div className="relative min-h-screen pb-24">
      {/* Top Nav */}
      <div className="border-b border-border-soft bg-surface/30 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-wide items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/database"
            className="group inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-mono text-xs uppercase tracking-widest">
              {locale === 'vi' ? '← QUAY LẠI TRUNG TÂM DATABASE' : '← BACK TO DATABASE HUB'}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-text-soft">
              {locale === 'vi' ? 'Live Interactive Sandboxes' : 'Live Interactive Sandboxes'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-wide px-6 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono font-medium mb-4">
          <Play size={12} fill="currentColor" />
          <span>DATABASE INTERNALS SIMULATION LAB</span>
        </div>
        <h1 className="text-display text-display-xl tracking-tight">
          {locale === 'vi' ? 'Phòng Thí Nghiệm Động Cơ Trực Quan' : 'Interactive Storage Engine Simulator'}
        </h1>
        <p className="mt-3 text-text-soft max-w-2xl text-sm leading-relaxed">
          {locale === 'vi'
            ? 'Tự tay thử nghiệm các thuật toán cốt lõi của PostgreSQL, MySQL InnoDB và DynamoDB: B+ Tree page splits, Clock page eviction và Consistent Hash Ring.'
            : 'Experiment directly with the core algorithms of PostgreSQL, MySQL InnoDB, and DynamoDB: B+ Tree page splitting, Buffer Pool Clock eviction, and Consistent Hash Rings.'}
        </p>

        {/* Tab Selector */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border-soft pb-4">
          <button
            onClick={() => setActiveTab('btree')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all',
              activeTab === 'btree'
                ? 'bg-accent text-bg font-bold shadow-md'
                : 'border border-border-soft bg-surface text-text-soft hover:text-text'
            )}
          >
            <Layers size={14} />
            <span>1. B+ Tree Page Split &amp; Search</span>
          </button>
          <button
            onClick={() => setActiveTab('clock')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all',
              activeTab === 'clock'
                ? 'bg-accent text-bg font-bold shadow-md'
                : 'border border-border-soft bg-surface text-text-soft hover:text-text'
            )}
          >
            <Clock size={14} />
            <span>2. Buffer Pool Clock Eviction</span>
          </button>
          <button
            onClick={() => setActiveTab('hashring')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all',
              activeTab === 'hashring'
                ? 'bg-accent text-bg font-bold shadow-md'
                : 'border border-border-soft bg-surface text-text-soft hover:text-text'
            )}
          >
            <Cpu size={14} />
            <span>3. Consistent Hash Ring</span>
          </button>
        </div>
      </section>

      {/* Simulator Body */}
      <main className="mx-auto max-w-wide px-6">
        {/* SIM 1: B+ TREE */}
        {activeTab === 'btree' && (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="rounded-2xl border border-border-soft bg-surface p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-text font-bold">
                  {locale === 'vi' ? 'Chèn khóa (Insert Key):' : 'Insert Integer Key:'}
                </span>
                <input
                  type="number"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-lg border border-border-soft bg-bg text-sm font-mono text-text focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleInsertKey}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-bg text-xs font-mono font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus size={14} />
                  <span>{locale === 'vi' ? 'Chèn & Tách trang' : 'Insert & Evaluate'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetBTree}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-soft text-text-soft hover:text-text text-xs font-mono transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>{locale === 'vi' ? 'Khôi phục ban đầu' : 'Reset Tree'}</span>
                </button>
              </div>
            </div>

            {/* Split notification */}
            {splitNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3"
              >
                <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs font-mono text-text leading-relaxed">{splitNotice}</p>
              </motion.div>
            )}

            {/* Tree Graphical Canvas */}
            <div className="rounded-2xl border border-border-soft bg-surface/50 p-8 min-h-[360px] flex flex-col items-center justify-center gap-12">
              {/* Root Page */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-text-soft uppercase tracking-wider mb-2">
                  ROOT PAGE (FANOUT)
                </span>
                <div
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 bg-surface shadow-md',
                    activePath.includes('root') ? 'border-accent ring-4 ring-accent/20' : 'border-border-soft'
                  )}
                >
                  {tree.keys.map((k, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-sm font-bold"
                    >
                      {k}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connecting lines */}
              <div className="w-full max-w-xl h-4 border-t-2 border-dashed border-sky-500/30 relative">
                <div className="absolute left-1/2 -top-1 w-2 h-2 rounded-full bg-accent -translate-x-1/2" />
              </div>

              {/* Leaf Pages */}
              <div className="flex flex-wrap items-center justify-center gap-6 w-full">
                {tree.children?.map((leaf) => {
                  const isActive = activePath.includes(leaf.id);
                  return (
                    <div key={leaf.id} className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-text-soft uppercase mb-1">
                        {leaf.id}
                      </span>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-300 bg-surface shadow-sm',
                          isActive ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-border-soft'
                        )}
                      >
                        {leaf.keys.map((k, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'px-2.5 py-1 rounded font-mono text-xs font-semibold',
                              k === searchTarget
                                ? 'bg-emerald-500 text-bg animate-pulse font-bold'
                                : 'bg-surface border border-border-soft text-text'
                            )}
                          >
                            {k}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SIM 2: CLOCK BUFFER POOL */}
        {activeTab === 'clock' && (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="rounded-2xl border border-border-soft bg-surface p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
                  {locale === 'vi' ? 'Thuật toán Clock Sweep (Second Chance)' : 'Clock Sweep Second Chance Eviction'}
                </h3>
                <p className="text-xs text-text-soft mt-1">
                  {locale === 'vi'
                    ? 'Quét vòng tròn qua các frame trong RAM. Nếu ref_bit = 1, chuyển về 0. Nếu ref_bit = 0 và unpinned, chọn làm Victim để hoán đổi trang.'
                    : 'Circular scan over RAM frames. If ref_bit = 1, clear to 0. If ref_bit = 0 and unpinned, choose as Victim for page replacement.'}
                </p>
              </div>

              <button
                onClick={handleClockStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg font-mono text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Clock size={15} />
                <span>{locale === 'vi' ? 'Xoay kim & Hoán đổi trang' : 'Advance Clock Hand'}</span>
              </button>
            </div>

            {/* Log terminal */}
            <div className="rounded-xl border border-border-soft bg-bg p-4 font-mono text-xs text-emerald-400">
              <span className="text-text-soft mr-2">&gt;</span>
              {clockLog}
            </div>

            {/* Frames Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {frames.map((f) => {
                const isUnderHand = clockPointer === f.id;
                return (
                  <div
                    key={f.id}
                    className={cn(
                      'relative rounded-2xl border-2 p-5 bg-surface transition-all duration-300 flex flex-col justify-between',
                      isUnderHand ? 'border-amber-400 shadow-lg shadow-amber-400/10' : 'border-border-soft'
                    )}
                  >
                    {isUnderHand && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-bg text-[10px] font-mono font-bold flex items-center gap-1">
                        <span>HAND</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold text-text">
                          Frame #{f.id}
                        </span>
                        {f.isDirty ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                            DIRTY
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            CLEAN
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-lg bg-surface border border-border-soft mb-3">
                        <span className="text-[10px] font-mono text-text-soft block mb-1">PAGE DATA</span>
                        <span className="font-mono text-sm font-bold text-sky-400">
                          Page #{f.pageId}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-border-soft text-[11px] font-mono text-text-soft">
                      <div className="flex justify-between">
                        <span>ref_bit:</span>
                        <span className={cn('font-bold', f.refBit === 1 ? 'text-emerald-400' : 'text-slate-400')}>
                          {f.refBit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>pin_count:</span>
                        <span className={f.pinned ? 'text-rose-400 font-bold' : 'text-text-soft'}>
                          {f.pinned ? 'PINNED (IN USE)' : '0 (FREE)'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SIM 3: CONSISTENT HASH RING */}
        {activeTab === 'hashring' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border-soft bg-surface p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
                  {locale === 'vi' ? '32-Bit Hash Ring & Virtual Nodes' : 'Consistent Hashing Virtual Ring'}
                </h3>
                <p className="text-xs text-text-soft mt-1">
                  {locale === 'vi'
                    ? 'Kéo thanh trượt hash của Key để xem thuật toán định tuyến theo chiều kim đồng hồ tới Server tiếp theo.'
                    : 'Slide key hash angle to watch clockwise routing to the next server node.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddRingNode}
                  disabled={ringNodes.length >= 6}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg font-mono text-xs font-bold disabled:opacity-50 transition-all"
                >
                  <Plus size={14} />
                  <span>{locale === 'vi' ? 'Thêm Server Node' : 'Add Server Node'}</span>
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="rounded-xl border border-border-soft bg-surface p-5 flex flex-col md:flex-row items-center gap-4">
              <span className="font-mono text-xs text-text min-w-[140px]">
                Key Hash Angle: {keyHashAngle}°
              </span>
              <input
                type="range"
                min="0"
                max="359"
                value={keyHashAngle}
                onChange={(e) => handleRingKeyChange(parseInt(e.target.value, 10))}
                className="w-full accent-accent"
              />
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold whitespace-nowrap">
                Routed to: {selectedRingServer}
              </div>
            </div>

            {/* Visual Ring Representation */}
            <div className="rounded-2xl border border-border-soft bg-surface/40 p-8 flex flex-col items-center justify-center min-h-[340px]">
              <div className="relative w-72 h-72 rounded-full border-4 border-dashed border-border-soft flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xs font-mono text-text-soft block">CONSISTENT RING</span>
                  <span className="text-xs font-mono font-bold text-accent">0 → 2³²-1</span>
                </div>

                {/* Nodes positioned along circle */}
                {ringNodes.map((n) => {
                  const rad = (n.angle * Math.PI) / 180;
                  const x = 144 + 130 * Math.sin(rad) - 20;
                  const y = 144 - 130 * Math.cos(rad) - 20;
                  const isSelected = selectedRingServer === n.name;
                  return (
                    <div
                      key={n.name}
                      className={cn(
                        'absolute w-10 h-10 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shadow-md transition-all',
                        isSelected ? 'ring-4 ring-accent scale-110' : ''
                      )}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        backgroundColor: n.color,
                        color: '#ffffff'
                      }}
                    >
                      {n.name.split('-')[1]}
                    </div>
                  );
                })}

                {/* Key indicator */}
                {(() => {
                  const rad = (keyHashAngle * Math.PI) / 180;
                  const x = 144 + 130 * Math.sin(rad) - 8;
                  const y = 144 - 130 * Math.cos(rad) - 8;
                  return (
                    <div
                      style={{ left: `${x}px`, top: `${y}px` }}
                      className="absolute w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white shadow-lg animate-pulse"
                      title={`Key Hash: ${keyHashAngle}°`}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
