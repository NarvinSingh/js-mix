function mixClass(...rest) {
  const classFactories = rest.slice(0, -1);
  const [BaseClass] = rest.slice(-1);
  return classFactories.reduceRight((Class, extendClass) => extendClass(Class), BaseClass);
}

function mixObject(...rest) {
  const classFactories = rest.slice(0, -1);
  const [baseObject] = rest.slice(-1);
  const BaseClass = function F() {};
  BaseClass.prototype = baseObject;
  return mixClass(...classFactories, BaseClass);
}

function mix(...classFactories) {
  return mixClass(...classFactories, Object);
}

function mixSuperclass(Class, ...requirements) {
  return mixClass(
    ...requirements
      // Keep requirements where the Class prototype is missing some of that requirement's methods
      .filter((requirement) => !requirement.methods.every(
        (method) => typeof Class.prototype[method] === 'function',
      ))
      // Get the factories that will create classes with the missing methods
      .map((requirement) => requirement.factory),
    // Mix the factories with Class to get a new class that contains the missing methods
    // If no methods were missing, factories will be an empty array and mixClass will return Class
    Class,
  );
}

export {
  mixClass,
  mixObject,
  mix,
  mixSuperclass,
};
