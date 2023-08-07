// Re-export everything from the deployments package (e.g. `addresses` and `abis`)
export * from '@nexusmutual/deployments';

// Export product data so it will be included in the bundle
export { default as products } from '../generated/products.json';
export { default as productTypes } from '../generated/product-types.json';

// Re-export the index file of the generated logos so it will be included in the bundle
// Note: the logos-src dir is copied by the build-src script
export * from '../generated/logos';
