/* eslint-disable max-classes-per-file */

import { mixClass, mixObject, mix } from './mix.mjs';

const createSpeaker = (Superclass = Object) => class Speaker extends Superclass {
  constructor(sound, ...superArgs) {
    super(...superArgs);
    this.sound = sound;
  }

  speak() {
    return `${this.sound}...`;
  }
};

const createEater = (Superclass = Object) => class Eater extends Superclass {
  constructor(energy, energyEfficiency, ...superArgs) {
    super(...superArgs);
    this.energy = energy;
    this.energyEfficiency = Math.max(0.9, energyEfficiency);
    this.bowelLoad = 0;
  }

  eat(amount) {
    this.energy += amount * this.energyEfficiency;
    this.bowelLoad += amount * (1 - this.energyEfficiency);
  }
};

const createPooper = (Superclass = Object) => class Pooper extends Superclass {
  constructor(...superArgs) {
    super(...superArgs);
    this.bowelLoad = this.bowelLoad || 0;
  }

  poop(amount) {
    this.bowelLoad -= amount;
  }
};

const createStaticClass1 = (Superclass = Object) => class StaticClass1 extends Superclass {
  static getStaticThing1() {
    return 'StaticClass1 thing';
  }
};

const createStaticClass2 = (Superclass = Object) => class StaticClass2 extends Superclass {
  static getStaticThing2() {
    return 'StaticClass2 thing';
  }
};

const sound = 'meow';
const energy = 10;
const energyEfficiency = 0.9;
const energyAmount = 12;
const poopAmount = 0.1;

describe.each([
  [
    'Pooper -> Eater -> Speaker',
    mix(createSpeaker, createEater, createPooper),
    [energy, energyEfficiency, sound],
  ],
  [
    'Pooper -> Speaker -> Eater',
    mix(createEater, createSpeaker, createPooper),
    [sound, energy, energyEfficiency],
  ],
  [
    'Speaker -> Pooper -> Eater',
    mix(createEater, createPooper, createSpeaker),
    [sound, energy, energyEfficiency],
  ],
  [
    'Eater -> Speaker -> Pooper',
    mix(createPooper, createSpeaker, createEater),
    [energy, energyEfficiency, sound],
  ],
  [
    'Speaker -> Eater -> Pooper',
    mix(createPooper, createEater, createSpeaker),
    [sound, energy, energyEfficiency],
  ],
  [
    'Pooper -> Eater -> Speaker',
    mixObject({}, createSpeaker, createEater, createPooper),
    [energy, energyEfficiency, sound],
  ],
  [
    'Pooper -> Eater -> Speaker',
    mixClass(createSpeaker(), createEater, createPooper),
    [energy, energyEfficiency, sound],
  ],
])('mix %s tests', (name, Cat, args) => {
  test('Prototype chain is correct', () => {
    const cat = new Cat(...args);
    const prototypes = [...Array(4)]
      .map((item, index) => [...Array(index + 1)]
        .reduce((acc) => Object.getPrototypeOf(acc), cat).constructor.name)
      .join(' -> ');

    expect(prototypes).toBe(`${name} -> Object`);
  });

  test.each([
    ['sound'],
    ['energy'],
    ['energyEfficiency'],
    ['bowelLoad'],
  ])('Has the property %s', (prop) => {
    const cat = new Cat(...args);

    expect(cat[prop]).toBeDefined();
  });

  test.each([
    ['speak'],
    ['eat'],
    ['poop'],
  ])('Has the shared method %s', (method) => {
    const cat1 = new Cat(...args);
    const cat2 = new Cat(...args);

    expect(cat1[method]).toBeInstanceOf(Function);
    expect(cat1[method]).toBe(cat2[method]);
  });

  test('Speaking makes a sound', () => {
    const cat = new Cat(...args);

    expect(cat.speak()).toBe(`${sound}...`);
  });

  test('Eating increases energy', () => {
    const cat = new Cat(...args);

    cat.eat(energyAmount);
    expect(cat.energy).toBe(energy + (energyAmount * energyEfficiency));
  });

  test('Eating increases bowel load', () => {
    const cat = new Cat(...args);

    cat.eat(energyAmount);
    expect(cat.bowelLoad).toBe(energyAmount * (1 - energyEfficiency));
  });

  test('Pooping decreases bowel load', () => {
    const cat = new Cat(...args);

    cat.eat(energyAmount);
    cat.poop(poopAmount);
    expect(cat.bowelLoad).toBe(energyAmount * (1 - energyEfficiency) - poopAmount);
  });
});

describe('mix StaticClass1 -> StaticClass2 tests', () => {
  test('Prototype chain is correct', () => {
    const StaticClass12 = mix(createStaticClass1, createStaticClass2);
    const prototypes = [...Array(2)]
      .map((item, index) => [...Array(index + 1)]
        .reduce((acc) => Object.getPrototypeOf(acc), StaticClass12).name)
      .join(' -> ');

    expect(`${StaticClass12.name} -> ${prototypes}`).toBe('StaticClass2 -> StaticClass1 -> Object');
  });

  test.each([
    ['getStaticThing1'],
    ['getStaticThing2'],
  ])('Has the static method %s', (method) => {
    const StaticClass12 = mix(createStaticClass1, createStaticClass2);

    expect(StaticClass12[method]).toBeInstanceOf(Function);
  });

  test.each([
    ['getStaticThing1'],
    ['getStaticThing2'],
  ])('Has the not shared static method %s', (method) => {
    const StaticClass12a = mix(createStaticClass1, createStaticClass2);
    const StaticClass12b = mix(createStaticClass1, createStaticClass2);

    expect(StaticClass12a[method]).toBeInstanceOf(Function);
    expect(StaticClass12b[method]).toBeInstanceOf(Function);
    expect(StaticClass12a[method]).not.toBe(StaticClass12b[method]);
  });

  test.each([
    ['getStaticThing1', 'StaticClass1 thing'],
    ['getStaticThing2', 'StaticClass2 thing'],
  ])('Static method %s gets correct value', (method, expectedValue) => {
    const StaticClass12 = mix(createStaticClass1, createStaticClass2);

    expect(StaticClass12[method]()).toBe(expectedValue);
  });
});

describe.each([
  [
    'Speaker -> StaticClass2 -> StaticClass1',
    mix(createStaticClass1, createStaticClass2, createSpeaker),
  ],
  [
    'StaticClass2 -> Speaker -> StaticClass1',
    mix(createStaticClass1, createSpeaker, createStaticClass2),
  ],
  [
    'StaticClass2 -> StaticClass1 -> Speaker',
    mix(createSpeaker, createStaticClass1, createStaticClass2),
  ],
])('mix %s tests', (name, Mixin) => {
  test('Prototype chain is correct', () => {
    const prototypes = [...Array(3)]
      .map((item, index) => [...Array(index + 1)]
        .reduce((acc) => Object.getPrototypeOf(acc), Mixin).name)
      .join(' -> ');

    expect(`${Mixin.name} -> ${prototypes}`).toBe(`${name} -> Object`);
  });

  test.each([
    ['getStaticThing1'],
    ['getStaticThing2'],
  ])('Class has the static method %s', (method) => {
    expect(Mixin[method]).toBeInstanceOf(Function);
  });

  test.each([
    ['getStaticThing1'],
    ['getStaticThing2'],
  ])('Instance does not have the static method %s', (method) => {
    const mixin = new Mixin('meow');

    expect(mixin[method]).not.toBeDefined();
  });

  test('Class does not have the method speak', () => {
    expect(Mixin.speak).not.toBeDefined();
  });

  test('Instance has the method speak', () => {
    const mixin = new Mixin('meow');

    expect(mixin.speak).toBeInstanceOf(Function);
  });

  test('Instance has the shared method speak', () => {
    const mixin1 = new Mixin('meow');
    const mixin2 = new Mixin('meow');

    expect(mixin1.speak).toBeInstanceOf(Function);
    expect(mixin1.speak).toBe(mixin2.speak);
  });

  test('Class does not have the property sound', () => {
    expect(Mixin.sound).not.toBeDefined();
  });

  test('Instance has the property sound', () => {
    const mixin = new Mixin('meow');

    expect(mixin.sound).toBeDefined();
  });

  test('Speaking makes a sound', () => {
    const mixin = new Mixin('meow');

    expect(mixin.speak()).toBe('meow...');
  });
});
