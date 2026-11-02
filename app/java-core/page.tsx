import { JavaCoreHubExperience } from '@/components/javacore/JavaCoreHubExperience';

export const metadata = {
  title: 'Java Core & JVM Internals — Architecture & Motion Visualizer',
  description: 'Deep dive into HotSpot JVM runtime memory areas, compressed OOPs, synchronized monitor lock inflation, Project Loom Virtual Threads, G1/ZGC garbage collection, AQS, JMM volatile cache coherence, and bytecode mechanics with pure Java 21.'
};

export default function JavaCorePage() {
  return <JavaCoreHubExperience />;
}
