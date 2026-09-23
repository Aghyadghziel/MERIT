import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'node_modules/**'],
    rules: {
      // Syncing UI state to the route (close the menu on navigation, measure
      // the header, hydrate the bag from storage) is a setState in an effect
      // by design. Kept as a warning so genuine cascades still show up.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];
