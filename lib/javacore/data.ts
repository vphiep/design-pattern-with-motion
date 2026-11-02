import type { JavaCoreTopic, JavaCoreCategory } from './types';
import { allJavaCoreTopics } from './content';

export { allJavaCoreTopics };

export function getAllJavaCoreTopics(): JavaCoreTopic[] {
  return [...allJavaCoreTopics].sort((a, b) => a.order - b.order);
}

export function getJavaCoreTopicById(id: string): JavaCoreTopic | undefined {
  return allJavaCoreTopics.find((t) => t.id === id);
}

export function getJavaCoreTopicsByCategory(category: JavaCoreCategory): JavaCoreTopic[] {
  return allJavaCoreTopics.filter((t) => t.category === category).sort((a, b) => a.order - b.order);
}

export function getAdjacentJavaCoreTopics(id: string): { prev?: JavaCoreTopic; next?: JavaCoreTopic } {
  const all = getAllJavaCoreTopics();
  const i = all.findIndex((t) => t.id === id);
  if (i < 0) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

export const JAVA_CORE_CATEGORY_META: Record<
  JavaCoreCategory,
  {
    label: { en: string; vi: string };
    description: { en: string; vi: string };
    icon: string;
    accentColor: string;
  }
> = {
  'java-fundamentals': {
    label: { en: 'Java Language Fundamentals', vi: 'Nền tảng Ngôn ngữ Java' },
    description: {
      en: 'Primitives vs References, String immutability & String Pool, OOP Polymorphism and vtable dispatch.',
      vi: 'Biến nguyên thủy vs Tham chiếu, tính bất biến String & String Pool, Đa hình OOP và bảng vtable.'
    },
    icon: 'BookOpen',
    accentColor: '#10b981'
  },
  'jvm-memory': {
    label: { en: 'JVM Memory & Garbage Collection', vi: 'Bộ nhớ JVM & Thu gom rác' },
    description: {
      en: 'Runtime Data Areas, 64-bit object headers, Compressed OOPs, Card Tables, G1 and low-latency ZGC.',
      vi: 'Phân vùng bộ nhớ JVM, header đối tượng 64-bit, Compressed OOPs, Card Table, G1 và ZGC độ trễ thấp.'
    },
    icon: 'Cpu',
    accentColor: '#e11d48'
  },
  'concurrency-juc': {
    label: { en: 'Concurrency, Synchronization & Virtual Threads', vi: 'Đồng thời, Khóa & Luồng ảo' },
    description: {
      en: 'Synchronized lock inflation, AbstractQueuedSynchronizer (AQS), JMM volatile barriers, and Java 21 Project Loom.',
      vi: 'Nâng cấp khóa synchronized, khung đồng bộ AQS, rào cản bộ nhớ JMM volatile và Virtual Threads Java 21.'
    },
    icon: 'Zap',
    accentColor: '#f43f5e'
  },
  'collections-internals': {
    label: { en: 'Collections Framework & Hashing Internals', vi: 'Cấu trúc Dữ liệu & Bảng băm' },
    description: {
      en: 'HashMap bitwise masking and treeification, ConcurrentHashMap lock-free reads, and ForwardingNode transfers.',
      vi: 'Mặt nạ bitwise và cây hóa HashMap, đọc phi khóa ConcurrentHashMap và di dời dữ liệu ForwardingNode.'
    },
    icon: 'Layers',
    accentColor: '#fb7185'
  },
  'advanced-features': {
    label: { en: 'Type System, Generics & Bytecode', vi: 'Hệ thống Kiểu, Generics & Bytecode' },
    description: {
      en: 'ClassLoader delegation, class lifecycle (<clinit>), stack machine execution, and Generics Type Erasure.',
      vi: 'Ủy quyền ClassLoader, vòng đời class (<clinit>), máy ảo stack bytecode và cơ chế Xóa Kiểu Generics.'
    },
    icon: 'Terminal',
    accentColor: '#fda4af'
  }
};
