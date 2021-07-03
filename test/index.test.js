const Snowflakes = require('../dist/index.js').default;

const flakes = new Snowflakes('test_signing_key');

test('creates and reads snowflake', () => {
  const flake = flakes.gen('test');
  expect(flakes.read(flake).type).toBe('test');
});

test('creates and verifies snowflake', () => {
  const flake = flakes.gen('test');
  expect(flakes.verify(flake).type).toBe('test');
});

test('recreates parent flake from child successfully', () => {
  const parent_flake = flakes.gen('test_parent');
  const child_flake = flakes.gen('test_child', parent_flake);

  const child = flakes.verify(child_flake);

  const recreated_parent = flakes.getParent(child, 'test_parent');

  expect(recreated_parent).toBe(parent_flake);
});

test('recreates parent flake from nested child successfully', () => {
  const parent_flake = flakes.gen('test_parent');
  const child_flake = flakes.gen('test_child', parent_flake);
  const nested_child_flake = flakes.gen('test_nested_child', child_flake);

  const nested_child = flakes.verify(nested_child_flake);

  const recreated_child_flake = flakes.getParent(nested_child, 'test_child');

  const recreated_child = flakes.verify(recreated_child_flake);

  const recreated_parent_flake = flakes.getParent(recreated_child, 'test_parent');

  expect(recreated_parent_flake).toBe(parent_flake);
  expect(recreated_child_flake).toBe(child_flake);
});

test('confirms the timestamps are read correctly', () => {
  const ts = Date.now();
  const flake = flakes.gen('test', undefined, ts);

  const data = flakes.verify(flake);

  expect(new Date(data.ts).getTime()).toBe(ts);
})

test('confirms elixir flakes are read correctly', () => {
  const parent_flake = 'test_45ef3bc731ecbab0e3cf0f7040b0';
  const child_flake = 'test_2504f08b0c7f21f4c3aa070a97c7f1ef7f0be0f315';
  const nested_child_flake = 'test_35104f009b00d7ff01ff4c73ea00b0aae7cc2f113f7730bba0ffa255';

  const nested_child = flakes.verify(nested_child_flake);

  const recreated_child_flake = flakes.getParent(nested_child, 'test');

  const recreated_child = flakes.verify(recreated_child_flake);

  const recreated_parent_flake = flakes.getParent(recreated_child, 'test');

  expect(recreated_parent_flake).toBe(parent_flake);
  expect(recreated_child_flake).toBe(child_flake);
})