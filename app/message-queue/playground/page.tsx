import { MessagingPlayground } from '@/components/messaging/MessagingPlayground';

export const metadata = {
  title: 'Distributed Messaging Playground — Live Flow Control & Broker Routing Simulator',
  description: 'Interactive sandbox for backpressure flow control (dQ/dt = λ - μ), RabbitMQ exchange routing, and Kafka consumer group rebalancing.'
};

export default function MessageQueuePlaygroundPage() {
  return <MessagingPlayground />;
}
