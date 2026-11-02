import { GoogleCoursePicker } from '@/components/home/GoogleCoursePicker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Interactive Labs — Khám phá các chuyên đề kiến trúc & hệ thống',
  description: 'Chọn chuyên đề học tập: Design Patterns (GoF), Database Internals, Change Data Capture (CDC), Message Queues, Docker, Security, và DevOps.'
};

export default function HomePage() {
  return <GoogleCoursePicker />;
}
