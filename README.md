# @baked/snowflakes


## Usage

```js
import Snowflakes from '@baked/snowflakes';

const flakes = new Snowflakes('test_signing_key');

// generates a snowflake of type "test_type"
const flake1 = flakes.gen('test_type');
// generates a child snowflake of type "test_child" based on flake1
const flake2 = flakes.gen('test_child', flake1);
// reads the snowflake data, ignoring integrity
const data1 = flakes.read(flake1);
// reads the snowflake data and checks the integrity
const data2 = flakes.verify(flake2);
// generates the parent of a child snowflake
const flake3 = flakes.getParent(data2, 'test_type');
```