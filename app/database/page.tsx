import { DatabaseHubExperience } from '@/components/database/DatabaseHubExperience';

export const metadata = {
  title: 'Database Internals & Storage — Architecture & Motion Visualizer',
  description: 'Deep dive into B+ Tree page splits, LSM-Tree SSTable compaction, MVCC Snapshot Isolation, Write-Ahead Logging (WAL), Buffer Pool eviction, and Consistent Hashing with pure Java 21.'
};

export default function DatabasePage() {
  return <DatabaseHubExperience />;
}
