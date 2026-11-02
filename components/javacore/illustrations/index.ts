'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { JdkJreJvmScene } from './JdkJreJvmScene';
import { HashCodeEqualsScene } from './HashCodeEqualsScene';
import { OopFoundationsScene } from './OopFoundationsScene';
import { PrimitivesReferencesScene } from './PrimitivesReferencesScene';
import { StringPoolScene } from './StringPoolScene';
import { CollectionsHierarchyScene } from './CollectionsHierarchyScene';
import { ModernJavaFeaturesScene } from './ModernJavaFeaturesScene';
import { ThreadLifecycleScene } from './ThreadLifecycleScene';
import { ConcurrencyHazardsScene } from './ConcurrencyHazardsScene';
import { ThreadPoolExecutorScene } from './ThreadPoolExecutorScene';
import { PolymorphismVtableScene } from './PolymorphismVtableScene';
import { JvmMemoryScene } from './JvmMemoryScene';
import { SynchronizedMonitorScene } from './SynchronizedMonitorScene';
import { VirtualThreadsScene } from './VirtualThreadsScene';
import { GarbageCollectionScene } from './GarbageCollectionScene';
import { AqsLockScene } from './AqsLockScene';
import { VolatileJmmScene } from './VolatileJmmScene';
import { HashMapScene } from './HashMapScene';
import { ConcurrentHashMapScene } from './ConcurrentHashMapScene';
import { ClassLoaderScene } from './ClassLoaderScene';
import { GenericsErasureScene } from './GenericsErasureScene';

export const JAVA_CORE_ILLUSTRATIONS: Record<string, ComponentType<SceneProps>> = {
  'jdk-jre-jvm': JdkJreJvmScene,
  'hashcode-equals-contract': HashCodeEqualsScene,
  'oop-foundations-solid': OopFoundationsScene,
  'primitives-vs-references': PrimitivesReferencesScene,
  'string-immutability-pool': StringPoolScene,
  'collections-framework-overview': CollectionsHierarchyScene,
  'java-modern-features': ModernJavaFeaturesScene,
  'multithreading-thread-lifecycle': ThreadLifecycleScene,
  'concurrency-hazards-atomics': ConcurrencyHazardsScene,
  'executors-threadpools': ThreadPoolExecutorScene,
  'oop-polymorphism-vtable': PolymorphismVtableScene,
  'jvm-memory-model': JvmMemoryScene,
  'synchronized-monitor': SynchronizedMonitorScene,
  'virtual-threads': VirtualThreadsScene,
  'garbage-collection': GarbageCollectionScene,
  'aqs-locks': AqsLockScene,
  'jmm-volatile': VolatileJmmScene,
  'hashmap-internals': HashMapScene,
  'concurrent-hashmap': ConcurrentHashMapScene,
  'classloader-bytecode': ClassLoaderScene,
  'generics-type-erasure': GenericsErasureScene,
};

export function getJavaCoreIllustration(id: string): ComponentType<SceneProps> {
  return JAVA_CORE_ILLUSTRATIONS[id] || JvmMemoryScene;
}
