# Mix
Create a class composed of mixin classes and an optional base class or object.

## Installation
```
$ npm install @narvin/mix
```

## Usage
Write classes that you want to use for composition as **mixin class factories**. The factory should take a `Superclass` parameter and return a class that extends that superclass.
```JavaScript
// This is a class factory
function createSpeaker(Superclass = Object) {
  return class Speaker extends Superclass {
    constructor(sound, ...superArgs) {
        super(...superArgs);
        this.sound = sound;
    }
    
    speak() {
        console.log(`I say ${this.sound}.`);
    }
  }
}

// This is another class factory
function createEater(Superclass = Object) {
  return class Eater extends Superclass {
    constructor(energy, ...superArgs) {
        super(...superArgs);
        this.energy = energy;
    }

    eat(amount) {
        this.energy += amount;
    }
  }
}
```
Now you can create a new class composed of mixin classes.
```JavaScript
const Eater = createEater();

// Prototype chain: Speaker -> Eater -> Object
const Cat = createSpeaker(Eater);

const mimi = new Cat('brawwr', 10);
mimi.speak(); // 'I say brawwr.'
mimi.eat(5);
console.log(mimi.energy); // 15
```
`mix` allows you to streamline the creation of these classes.
```JavaScript
import { mix } from '@narvin/mix'

// Prototype chain: Speaker -> Eater -> Object
const Cat = mix(createSpeaker, createEater);

const mimi = new Cat('brawwr', 10);
```
`mixClass` allows you to extend a single non-mixin class then mix it with mixin classes. The non-mixin class will come after the mixin classes in the prototype chain.
```JavaScript
import { mixClass } from '@narvin/mix'
class Jumper {
    jump() {
        console.log('Uh, no.');
    }
}

// Prototype chain: Speaker -> Eater -> Jumper -> Object
const Cat = mixClass(Jumper, createSpeaker, createEater);

const mimi = new Cat('brawwr', 10);
mimi.jump(); // 'Uh, no.'
```
`mixObject` allows you to inherit from an object then mix it with mixin classes. The object will come after the mixin classes in the prototype chain.
```JavaScript
import { mixObject } from '@narvin/mix'

const stash {
    toys: ['string', 'ball', 'sock']
}

// Prototype chain: Speaker -> Eater -> stash -> Object
const Cat = mixObject(stash, createSpeaker, createEater);

const mimi = new Cat('brawwr', 10);
console.log(mimi.toys[0]); // 'string'
```
