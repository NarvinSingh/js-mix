function mixClass(BaseClass, ...classFactories) {
  return classFactories.reduce((Class, extendClass) => extendClass(Class), BaseClass);
}

function mixObject(baseObject, ...classFactories) {
  const BaseClass = function F() {};
  BaseClass.prototype = baseObject;
  return mixClass(BaseClass, ...classFactories);
}

function mix(...classFactories) {
  return mixClass(Object, ...classFactories);
}

export { mixClass, mixObject, mix };
