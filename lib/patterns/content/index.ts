import type { Pattern } from '../types';
import { singleton } from './singleton';
import { factoryMethod } from './factory-method';
import { abstractFactory } from './abstract-factory';
import { builder } from './builder';
import { prototype } from './prototype';
import { adapter } from './adapter';
import { bridge } from './bridge';
import { composite } from './composite';
import { decorator } from './decorator';
import { facade } from './facade';
import { flyweight } from './flyweight';
import { proxy } from './proxy';
import { chainOfResponsibility } from './chain-of-responsibility';
import { command } from './command';
import { interpreter } from './interpreter';
import { iterator } from './iterator';
import { mediator } from './mediator';
import { memento } from './memento';
import { observer } from './observer';
import { state } from './state';
import { strategy } from './strategy';
import { templateMethod } from './template-method';
import { visitor } from './visitor';

export const allPatterns: Pattern[] = [
  singleton,
  factoryMethod,
  abstractFactory,
  builder,
  prototype,
  adapter,
  bridge,
  composite,
  decorator,
  facade,
  flyweight,
  proxy,
  chainOfResponsibility,
  command,
  interpreter,
  iterator,
  mediator,
  memento,
  observer,
  state,
  strategy,
  templateMethod,
  visitor
];

export {
  singleton,
  factoryMethod,
  abstractFactory,
  builder,
  prototype,
  adapter,
  bridge,
  composite,
  decorator,
  facade,
  flyweight,
  proxy,
  chainOfResponsibility,
  command,
  interpreter,
  iterator,
  mediator,
  memento,
  observer,
  state,
  strategy,
  templateMethod,
  visitor
};
