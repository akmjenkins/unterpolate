import { getter } from 'property-expr';

const matcher = /\{(.+?)\}/g;

export const interpolate = (template, val, options = {}) => {
  let fullReplacement;
  const match = options.match || matcher;
  const matched = template.match(match);

  // template doesn't contain any interpolation points
  if (!matched) return template;

  // if the template is equal to a single interpolation point - e.g. '{full.name}'
  // then set a flag to return the full entity retrieved from the getter (full entity could be an array, object, or something else)
  const replaceFull = matched.length === 1 && matched[0] === template;

  // interpolation function
  const replaced = template.replace(match, (_, t) => {
    const replaceWith = getter(fixNumericKeys(t), true)(val);

    if (!replaceFull) return replaceWith || '';

    // flag is set so we don't care about replacements being
    // applied to the template - we only need the first replacement
    fullReplacement = replaceWith;
    return '';
  });

  return replaceFull ? fullReplacement : replaced;
};

export const unmatch = (template, val, options = {}) => {
  const match = options.match || matcher;
  const groups = [];
  // convert a template to a regexp such that
  // {year}-{month}-{day} becomes (.*)-(.*)-(.*)
  const regexp = new RegExp(
    template.replace(match, (_, m) => {
      // while we're at it, put the name of what is being interpolated - e.g. year in {year} or month in {month}
      // in the array "groups"
      return groups.push(m), `(.*)`;
    })
  );

  // if the value we're unmatching is NOT a string
  // e.g.
  // template: '{first.first}'
  // value: ['tom','dick','harry']
  if (typeof val !== 'string') {
    // then there SHOULD only be ONE matching group - e.g. '{first.first}' - if not, user error
    if (groups.length > 1)
      throw new Error(
        `Cannot unterpolate a string template against a non-string value`
      );
    return { [groups[0]]: val };
  }

  const matches = val.match(regexp);

  // for each interpolation parameter return the corresponding match
  // tried to do this with named capture groups, but characters are restrictive
  // which is why we just use the groups array
  return groups.reduce(
    (acc, k, idx) => ({
      ...acc,
      [k]: matches ? matches[idx + 1] : undefined,
    }),
    {}
  );
};

// flat doesn't support square bracket notation, but property-expr does
// easiest thing to do is to change numeric paths to square bracket
// notation before using getter from property-expr
const fixNumericKeys = template =>
  template.replace(/\.(\d+)/g, (a, b) => `[${b}]`);
