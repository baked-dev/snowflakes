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
  // these snowflakes were generated in elixir
  const parent_flake = 'test_parent_254fbb1e371e544567cf9f307040';
  const child_flake = 'test_child_e50ef02b07eff7f6e7b4539417e6f7afeb0b00fb15';
  const nested_child_flake = 'test_nested_child_e5152f0f6b0b9efe67f7ee7e449419459be71f7fcfefc0b000f0d250';

  const nested_child = flakes.verify(nested_child_flake);

  const recreated_child_flake = flakes.getParent(nested_child, 'test_child');

  const recreated_child = flakes.verify(recreated_child_flake);

  const recreated_parent_flake = flakes.getParent(recreated_child, 'test_parent');

  expect(recreated_parent_flake).toBe(parent_flake);
  expect(recreated_child_flake).toBe(child_flake);
})