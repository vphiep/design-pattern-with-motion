import type { JavaCoreTopic } from '../types';
import { jdkJreJvmTopic } from './jdk-jre-jvm';
import { hashcodeEqualsContractTopic } from './hashcode-equals-contract';
import { oopFoundationsSolidTopic } from './oop-foundations-solid';
import { primitivesVsReferencesTopic } from './primitives-vs-references';
import { stringImmutabilityPoolTopic } from './string-immutability-pool';
import { collectionsFrameworkOverviewTopic } from './collections-framework-overview';
import { javaModernFeaturesTopic } from './java-modern-features';
import { multithreadingThreadLifecycleTopic } from './multithreading-thread-lifecycle';
import { concurrencyHazardsAtomicsTopic } from './concurrency-hazards-atomics';
import { executorsThreadpoolsTopic } from './executors-threadpools';
import { oopPolymorphismVtableTopic } from './oop-polymorphism-vtable';
import { jvmMemoryModel } from './jvm-memory-model';
import { synchronizedMonitor } from './synchronized-monitor';
import { virtualThreads } from './virtual-threads';
import { garbageCollection } from './garbage-collection';
import { aqsLocks } from './aqs-locks';
import { jmmVolatile } from './jmm-volatile';
import { hashmapInternals } from './hashmap-internals';
import { concurrentHashmap } from './concurrent-hashmap';
import { classloaderBytecode } from './classloader-bytecode';
import { genericsTypeErasure } from './generics-type-erasure';

export const allJavaCoreTopics: JavaCoreTopic[] = [
  // --- TRACK 1: FUNDAMENTALS (Cơ bản) ---
  jdkJreJvmTopic,
  hashcodeEqualsContractTopic,
  oopFoundationsSolidTopic,
  primitivesVsReferencesTopic,
  stringImmutabilityPoolTopic,
  collectionsFrameworkOverviewTopic,
  javaModernFeaturesTopic,
  multithreadingThreadLifecycleTopic,
  concurrencyHazardsAtomicsTopic,
  executorsThreadpoolsTopic,

  // --- TRACK 2: ADVANCED & JVM INTERNALS (Nâng cao) ---
  oopPolymorphismVtableTopic,
  jvmMemoryModel,
  synchronizedMonitor,
  virtualThreads,
  garbageCollection,
  aqsLocks,
  jmmVolatile,
  hashmapInternals,
  concurrentHashmap,
  classloaderBytecode,
  genericsTypeErasure,
];

export {
  jdkJreJvmTopic,
  hashcodeEqualsContractTopic,
  oopFoundationsSolidTopic,
  primitivesVsReferencesTopic,
  stringImmutabilityPoolTopic,
  collectionsFrameworkOverviewTopic,
  javaModernFeaturesTopic,
  multithreadingThreadLifecycleTopic,
  concurrencyHazardsAtomicsTopic,
  executorsThreadpoolsTopic,
  oopPolymorphismVtableTopic,
  jvmMemoryModel,
  synchronizedMonitor,
  virtualThreads,
  garbageCollection,
  aqsLocks,
  jmmVolatile,
  hashmapInternals,
  concurrentHashmap,
  classloaderBytecode,
  genericsTypeErasure,
};
