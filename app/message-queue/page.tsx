import { MessagingHubExperience } from '@/components/messaging/MessagingHubExperience';

export const metadata = {
  title: 'Distributed Messaging & Streaming — Apache Kafka vs RabbitMQ Visualizer',
  description: 'Master core distributed systems challenges: temporal decoupling, delivery semantics, poison messages, partition replication, consumer rebalance, backpressure, and transactional outbox.'
};

export default function MessageQueuePage() {
  return <MessagingHubExperience />;
}
