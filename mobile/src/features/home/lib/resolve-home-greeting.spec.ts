import { resolveHomeGreeting } from './resolve-home-greeting';

describe('resolveHomeGreeting', () => {
  it('uses the first token of displayName', () => {
    const actual = resolveHomeGreeting({
      displayName: 'Aisha Rahimah',
      email: 'aisha@example.com',
      now: new Date('2026-09-12T08:00:00'),
    });
    expect(actual.phrase).toBe('Good morning');
    expect(actual.name).toBe('Aisha');
  });

  it('falls back to email when displayName is missing', () => {
    const actual = resolveHomeGreeting({
      displayName: null,
      email: 'reader@example.com',
      now: new Date('2026-09-12T19:00:00'),
    });
    expect(actual.phrase).toBe('Good evening');
    expect(actual.name).toBe('reader@example.com');
  });

  it('uses afternoon between noon and 18:00', () => {
    const actual = resolveHomeGreeting({
      displayName: '  Sam  ',
      email: 'sam@example.com',
      now: new Date('2026-09-12T15:30:00'),
    });
    expect(actual.phrase).toBe('Good afternoon');
    expect(actual.name).toBe('Sam');
  });
});
