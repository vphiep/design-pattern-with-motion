import { ALL_MESSAGING_TOPICS, MESSAGING_TOPIC_MAP } from './content';
import type { MessagingTopic, MessagingCategory, MessagingLevel } from './types';

export const MESSAGING_CATEGORY_META: Record<
  MessagingCategory,
  {
    label: { en: string; vi: string };
    chapter: string;
    description: { en: string; vi: string };
    icon: string;
    accentColor: string;
  }
> = {
  'messaging-fundamentals': {
    label: {
      en: 'Messaging Fundamentals & Asynchronous Systems',
      vi: 'Nền tảng Hàng đợi & Hệ thống Bất đồng bộ'
    },
    chapter: 'Chương 01',
    description: {
      en: 'Temporal decoupling, delivery semantics, and event-driven patterns.',
      vi: 'Phân tách thời gian, ngữ nghĩa phân phát bản tin và mẫu kiến trúc hướng sự kiện.'
    },
    icon: 'Layers',
    accentColor: '#8b5cf6'
  },
  'rabbitmq-broker': {
    label: {
      en: 'RabbitMQ Architecture & Routing Protocols',
      vi: 'Kiến trúc RabbitMQ & Định tuyến Exchange'
    },
    chapter: 'Chương 02',
    description: {
      en: 'Exchanges, queue prefetch QoS, dead-letter exchanges, and backoff retries.',
      vi: 'Các loại sàn giao dịch Exchange, prefetch QoS, hàng đợi chết DLQ và thử lại lũy thừa.'
    },
    icon: 'Compass',
    accentColor: '#f97316'
  },
  'kafka-streaming': {
    label: {
      en: 'Apache Kafka Distributed Streaming Architecture',
      vi: 'Hạ tầng Phân tán Apache Kafka'
    },
    chapter: 'Chương 03',
    description: {
      en: 'Commit logs, partition replication, batching compression, consumer rebalancing, and EOS.',
      vi: 'Nhật ký phân vùng, nén batch, tái cân bằng nhóm tiêu thụ và giao dịch Exactly-Once.'
    },
    icon: 'Activity',
    accentColor: '#06b6d4'
  },
  'reliability-backpressure': {
    label: {
      en: 'Reliability, Backpressure & Production Design',
      vi: 'Độ tin cậy, Backpressure & Thiết kế Sản xuất'
    },
    chapter: 'Chương 04',
    description: {
      en: 'Backpressure flow control, consumer lag, and Transactional Outbox patterns.',
      vi: 'Kiểm soát áp suất ngược, độ trễ Consumer Lag và mẫu thiết kế Transactional Outbox.'
    },
    icon: 'ShieldCheck',
    accentColor: '#10b981'
  },
  'advanced-streaming': {
    label: {
      en: 'Advanced Streaming, Quorums & Enterprise Hardening',
      vi: 'Hệ thống Nâng cao, Quorum Queues & Mở rộng'
    },
    chapter: 'Nâng Cao',
    description: {
      en: 'Log compaction, Kafka Streams, Quorum Raft, MirrorMaker 2, Zero-Copy, and mTLS security.',
      vi: 'Nén log, Kafka Streams, Quorum Raft, dự phòng thảm họa MM2, Zero-Copy và bảo mật mTLS.'
    },
    icon: 'Cpu',
    accentColor: '#a855f7'
  }
};

export function getAllMessagingTopics(): MessagingTopic[] {
  return ALL_MESSAGING_TOPICS;
}

export function getCoreMessagingTopics(): MessagingTopic[] {
  return ALL_MESSAGING_TOPICS.filter((t) => t.level === 'core');
}

export function getAdvancedMessagingTopics(): MessagingTopic[] {
  return ALL_MESSAGING_TOPICS.filter((t) => t.level === 'advanced');
}

export function getMessagingTopicsByCategory(category: MessagingCategory): MessagingTopic[] {
  return ALL_MESSAGING_TOPICS.filter((t) => t.category === category);
}

export function getMessagingTopicById(id: string): MessagingTopic | undefined {
  return MESSAGING_TOPIC_MAP.get(id);
}

export function getAdjacentMessagingTopics(currentId: string): {
  prev: MessagingTopic | null;
  next: MessagingTopic | null;
} {
  const index = ALL_MESSAGING_TOPICS.findIndex((t) => t.id === currentId);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? ALL_MESSAGING_TOPICS[index - 1] : null,
    next: index < ALL_MESSAGING_TOPICS.length - 1 ? ALL_MESSAGING_TOPICS[index + 1] : null
  };
}
