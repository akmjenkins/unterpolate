import { unflatten } from 'flat';
import { unmatch } from './utils';

// parent value -> child object
const unto = (template, val, options = {}, unflat = true) => {
  const ret = val => (val && unflat ? unflatten(val) : val);

  if (typeof template === 'function')
    return ret(template(val, { ...options, how: 'to' }));

  if (typeof template === 'string') return ret(unmatch(template, val, options));

  if (Array.isArray(template))
    return ret(
      template.reduce(
        (acc, t, idx) => ({ ...acc, ...unto(t, val[idx], options, false) }),
        {}
      )
    );

  return ret(
    Object.entries(template).reduce(
      (acc, [key, value]) => ({
        ...acc,
        ...unto(value, val[key], options, false),
      }),
      {}
    )
  );
};

export default unto;
