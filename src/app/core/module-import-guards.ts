/**
 * This script enforces that core-modules are only loaded once as they are intended to be Singletons!
 */
export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only!`);
  }
}
