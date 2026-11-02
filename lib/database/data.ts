import type { DatabaseTopic, DatabaseCategory } from './types';
import { allDatabaseTopics } from './content';

export { allDatabaseTopics };

export function getAllDatabaseTopics(): DatabaseTopic[] {
  return [...allDatabaseTopics].sort((a, b) => a.order - b.order);
}

export function getTopicById(id: string): DatabaseTopic | undefined {
  return allDatabaseTopics.find((t) => t.id === id);
}

export function getTopicsByCategory(category: DatabaseCategory): DatabaseTopic[] {
  return allDatabaseTopics.filter((t) => t.category === category).sort((a, b) => a.order - b.order);
}

export function getAdjacentTopics(id: string): { prev?: DatabaseTopic; next?: DatabaseTopic } {
  const all = getAllDatabaseTopics();
  const i = all.findIndex((t) => t.id === id);
  if (i < 0) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

export const DATABASE_CATEGORY_META: Record<
  DatabaseCategory,
  {
    label: { en: string; vi: string };
    description: { en: string; vi: string };
    icon: string;
    accentColor: string;
  }
> = {
  'storage-engines': {
    label: { en: 'Storage Engines & Page Layouts', vi: 'Động cơ Lưu trữ & Cấu trúc Trang' },
    description: {
      en: 'B+ Trees, Slotted Pages, LSM-Trees, and Columnar Parquet disk blocks.',
      vi: 'Cấu trúc cây B+ Tree, tổ chức trang Slotted Page, nén LSM-Tree và lưu trữ cột.'
    },
    icon: 'Layers',
    accentColor: '#0284c7'
  },
  'indexing-techniques': {
    label: { en: 'Indexing & Search Structures', vi: 'Cấu trúc Chỉ mục & Tối ưu Tra cứu' },
    description: {
      en: 'Extendible Hashing, Inverted Indices, Bitmap Scans, and Spatial R-Trees.',
      vi: 'Băm động Extendible Hash, chỉ mục đảo ngữ, quét Bitmap và cây không gian R-Tree.'
    },
    icon: 'Search',
    accentColor: '#0ea5e9'
  },
  'buffer-memory': {
    label: { en: 'Buffer Pool & Cache Management', vi: 'Quản lý Bộ nhớ đệm & Caching' },
    description: {
      en: 'Frame tables, Clock / 2Q eviction algorithms, and External Merge Sort.',
      vi: 'Quản lý khung nhớ RAM, giải thuật giải phóng Clock/2Q và sắp xếp ngoài đĩa.'
    },
    icon: 'Cpu',
    accentColor: '#10b981'
  },
  'concurrency-tx': {
    label: { en: 'Concurrency & MVCC Transactions', vi: 'Đồng thời, Giao dịch & MVCC' },
    description: {
      en: 'Transaction isolation anomalies, Strict 2PL, MVCC snapshots, and SSI.',
      vi: 'Các lỗi dị thường giao dịch, khóa 2PL, phiên bản đa bản ghi MVCC và SSI.'
    },
    icon: 'GitFork',
    accentColor: '#8b5cf6'
  },
  'durability-wal': {
    label: { en: 'Durability, WAL & Crash Recovery', vi: 'Bền vững, Nhật ký WAL & Phục hồi' },
    description: {
      en: 'Write-Ahead Logging (WAL), LSN checkpointing, ARIES Redo/Undo, and Doublewrite.',
      vi: 'Nhật ký ghi trước WAL, checkpoint LSN, giải thuật ARIES và bộ đệm Doublewrite.'
    },
    icon: 'ShieldCheck',
    accentColor: '#f59e0b'
  },
  'distributed-consensus': {
    label: { en: 'Distributed Databases & Consensus', vi: 'Cơ sở Dữ liệu Phân tán & Đồng thuận' },
    description: {
      en: 'Consistent Hash Rings, Raft consensus replication, and Two-Phase Commit.',
      vi: 'Vòng băm phân mảnh nhất quán, giao thức đồng thuận Raft và giao dịch 2PC.'
    },
    icon: 'Server',
    accentColor: '#ec4899'
  }
};
