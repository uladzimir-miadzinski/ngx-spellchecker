export function debounce(delay: number = 300): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    
    descriptor.value = function(...args) {
      clearTimeout(this.__timeout__);
      this.__timeout__ = setTimeout(() => original.apply(this, args), delay);
    };
    
    return descriptor;
  };
}
