import { interpolate } from './utils';

//  child object -> parent value
const unfrom = (template, val, options) => {
  if (typeof template === 'function')
    return template(val, { ...options, how: 'from' });

  if (typeof template === 'string') return interpolate(template, val, options);

  if (Array.isArray(template))
    return template.map(t => unfrom(t, val, options));

  return Object.entries(template).reduce(
    (acc, [key, v]) => ({
      ...acc,
      [key]: unfrom(v, val, options),
    }),
    {}
  );
};

export default unfrom;
