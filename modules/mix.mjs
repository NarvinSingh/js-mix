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

export { mixClass, mixObject, mix };
