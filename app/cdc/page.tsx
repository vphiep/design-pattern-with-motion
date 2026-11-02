import { CdcHub } from '@/components/cdc/CdcCourse';

export const metadata = {
  title: 'Change Data Capture (CDC) — WAL, Debezium & Transactional Outbox',
  description:
    'Dual writes, PostgreSQL WAL & logical decoding, MySQL binlog/GTID, Debezium on Kafka Connect, incremental snapshots and the Outbox Event Router.'
};

export default function CdcPage() {
  return <CdcHub />;
}
