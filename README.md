# unterpolate

-- 

Unterpolate is used to map a template (`string`, `array`, `object`) and value to an object representation **and back again**.

```js
import { to, from } from 'unterpolate';

const template = '{year}-{month}-{day}';
const interpolated = '2019-10-01';

to(template,interpolated) 
/*
{
    year:'2019',
    month:'10',
    day:'01'
}
*/

from(template,{
    year:'2019',
    month:'10',
    day:'01'
});

// '2019-10-01'
```

## Usage

Interpolations are everywhere - use a single template and create multiple strings from it depending on variable pieces. Interpolation is a solution that makes it much easier to generate dynamic strings.

Interpolation doesn't have to stop at strings, we can use it to map values from one data structure to another, which is why `unterpolate` was created.

### simple string mapping

In addition to simple string mapping (see the first `to`/`from` example) `unterpolate` supports nested transformations care of [flat](https://www.npmjs.com/package/flat) and [property-expr](https://www.npmjs.com/package/property-expr).

```js
import { to, from } from 'unterpolate';


const template = '{first.second}-{first.third}-something-{first.fifth.0}';
const interpolated = '2019-10-something-01';

to(template,interpolated) 

/*
{
    first: {
        second:'2019',
        third:'10',
        fifth:['01']
    }
}
*/

from(template,{
    first: {
        second:'2019',
        third:'10',
        fifth:['01','02','03','04'] // extraneous values will be ignored
    }
});

// '2019-10-something-01'


```

### complex object/array mapping

We don't only `interpolate` an object's values to a string, we can interpolate them into a complex structure:

#### interpolated value is an array

```js
const template = ['{first}','{second.first}','{third}-something'];
const interpolated = [['an','array'],20,'somestring-something'];

to(template,interpolated);
/*
{
    first: ['an','array'],
    second: {
        first:20
    },
    third: 'somestring'
}
*/

// and magically...

from(template,{
    first:{
        first:'a',
        second:'b',
    },
    second: {
        first:['an','array']
    },
    third:'must be a string'
});

/*
[
    {
        first:'a',
        second:'b'
    },
    ['an','array'],
    'must be a string-something'
]
*/

```

#### interpolated value is an object

```js
const template = {
    first:'{someKey}',
    second: {
        third: '{first.first.0}'
    },
    fourth:[
        'key1', // no { }
        '{key1}',
        '{first.second}'
    ]
}

const interpolated = {
    first:'something',
    second: {
        third: ['joe']
    },
    fourth: [
        'key1',
        'tom',
        'bill'
    ]
}

to(template,interpolated);
/*
{
    someKey:'something',
    first: {
        first:['joe'],
        second:'bill'
    },
    key1:'tom',
}
*/


```

### in/unterpolating using a function

Truth be told, `unterpolate` was created to be able to do transformations through configuration which, under the circumstances in which it was developed,  generally meant "through strings".

For full flexibility, `unterpolate` does support using a function to perform `interpolations` and their reverse operations.

The function receives the the `value` being in/unterpolated and the options given to the `to/from` function with a key of `how` whose value is either `to` or `from`.

Note: If `to` the return value from the function **must be false-y or an object** - anything else will throw an error.

```js
import { to, from } from 'unterpolate';

const template = {
    first: (val, opts) => opts.how === 'to' ? { prop: val / 2 } : val['prop'] * 2
};

const value = {
    first: 20,
};

const expected = {
    prop: 10,
};

to(template,value); // { prop: 10 }
from(template,expected); // { first: 20 }
```

### `match` regexp

The default `RegExp` that determines what is an interpolation is `/\{(.+?)\}/g` - or **anything enclosed in curly braces** - i.e. `{first}`.

An object is created out of the matched strings which is then [unflattened](https://www.npmjs.com/package/flat#unflattenoriginal-options) to create non-trivial structures.

You can pass a different `match` regexp, if it suits your purposes, to `to` and `from` like so:

```js

const template = '$year$-$month$-$day$'
to(template,'2019-10-01',{match:/\$(.+?)\$/g})

/*
{
    year:'2019',
    month:'10',
    day:'01'
}
*

```

## API

### `to(template: string | function | object | array, value: any, options: {match: RegExp}): Uninterpolated Object`

The `to` method is what creates the uninterpolated object from the template and value.

### `from(template: string | function | object | array, value: object, options: {match: RegExp}): Interpolated Value`

The `from` method is what creates the interpolated value from the object