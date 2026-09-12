export type ResolveHomeGreetingInput = {
  readonly displayName: string | null | undefined;
  readonly email: string;
  readonly now?: Date;
};

export type HomeGreeting = {
  readonly phrase: string;
  readonly name: string;
};

/**
 * Builds a time-of-day greeting and first-name identity. Falls back to email when name is missing.
 */
export function resolveHomeGreeting(input: ResolveHomeGreetingInput): HomeGreeting {
  return {
    phrase: resolveGreetingPhrase(input.now ?? new Date()),
    name: resolveGreetingName(input.displayName, input.email),
  };
}

function resolveGreetingPhrase(now: Date): string {
  const hour: number = now.getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function resolveGreetingName(displayName: string | null | undefined, email: string): string {
  const trimmed: string = displayName?.trim() ?? '';
  if (trimmed.length === 0) {
    return email;
  }
  const firstToken: string | undefined = trimmed.split(/\s+/)[0];
  if (firstToken === undefined || firstToken.length === 0) {
    return email;
  }
  return firstToken;
}
