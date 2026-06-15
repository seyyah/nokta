import AsyncStorage from '@react-native-async-storage/async-storage';

const FAIL_KEY = '@nokta/forge_consecutive_fail';
const STUCK_KEY = '@nokta/forge_stuck';

export type CycleOutcome = 'success' | 'fail' | 'rollback';

export async function recordCycleOutcome(outcome: CycleOutcome): Promise<{
  consecutiveFails: number;
  isStuck: boolean;
}> {
  const raw = await AsyncStorage.getItem(FAIL_KEY);
  let consecutive = raw ? Number(raw) : 0;

  if (outcome === 'success') {
    consecutive = 0;
    await AsyncStorage.setItem(STUCK_KEY, 'false');
  } else {
    consecutive += 1;
  }

  await AsyncStorage.setItem(FAIL_KEY, String(consecutive));
  const isStuck = consecutive >= 2;
  if (isStuck) await AsyncStorage.setItem(STUCK_KEY, 'true');
  return { consecutiveFails: consecutive, isStuck };
}

export async function getForgeStatus(): Promise<{
  consecutiveFails: number;
  isStuck: boolean;
}> {
  const fails = Number((await AsyncStorage.getItem(FAIL_KEY)) ?? '0');
  const stuck = (await AsyncStorage.getItem(STUCK_KEY)) === 'true' || fails >= 2;
  return { consecutiveFails: fails, isStuck: stuck };
}

export async function resetForgeStatus(): Promise<void> {
  await AsyncStorage.multiRemove([FAIL_KEY, STUCK_KEY]);
}
