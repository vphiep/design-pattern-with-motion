'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from './scene';
import Singleton from '@/components/illustrations/singleton';
import FactoryMethod from '@/components/illustrations/factory-method';
import AbstractFactory from '@/components/illustrations/abstract-factory';
import Builder from '@/components/illustrations/builder';
import Prototype from '@/components/illustrations/prototype';
import Adapter from '@/components/illustrations/adapter';
import Bridge from '@/components/illustrations/bridge';
import Composite from '@/components/illustrations/composite';
import Decorator from '@/components/illustrations/decorator';
import Facade from '@/components/illustrations/facade';
import Flyweight from '@/components/illustrations/flyweight';
import Proxy from '@/components/illustrations/proxy';
import ChainOfResponsibility from '@/components/illustrations/chain-of-responsibility';
import Command from '@/components/illustrations/command';
import Interpreter from '@/components/illustrations/interpreter';
import Iterator from '@/components/illustrations/iterator';
import Mediator from '@/components/illustrations/mediator';
import Memento from '@/components/illustrations/memento';
import Observer from '@/components/illustrations/observer';
import State from '@/components/illustrations/state';
import Strategy from '@/components/illustrations/strategy';
import TemplateMethod from '@/components/illustrations/template-method';
import Visitor from '@/components/illustrations/visitor';

export const ILLUSTRATIONS: Record<string, ComponentType<SceneProps>> = {
  singleton: Singleton,
  'factory-method': FactoryMethod,
  'abstract-factory': AbstractFactory,
  builder: Builder,
  prototype: Prototype,
  adapter: Adapter,
  bridge: Bridge,
  composite: Composite,
  decorator: Decorator,
  facade: Facade,
  flyweight: Flyweight,
  proxy: Proxy,
  'chain-of-responsibility': ChainOfResponsibility,
  command: Command,
  interpreter: Interpreter,
  iterator: Iterator,
  mediator: Mediator,
  memento: Memento,
  observer: Observer,
  state: State,
  strategy: Strategy,
  'template-method': TemplateMethod,
  visitor: Visitor
};

export function getIllustration(id: string): ComponentType<SceneProps> | undefined {
  return ILLUSTRATIONS[id];
}
