// Design system modeled on the reference: warm cream gradients, heavy black
// typography, pill shapes, black primary actions, gold selection accents,
// and lavender count badges.

export const colors = {
  bgTop: '#FCFAF4',
  bgBottom: '#F0E7D3',
  surface: '#FFFFFF',
  ink: '#15130E', // near-black for headings + primary buttons
  inkSoft: '#736C5C', // warm muted gray
  primary: '#15130E',
  gold: '#E8B84B',
  goldSoft: '#F6E4AE',
  border: '#ECE4D3',
  danger: '#E5484D',
  dangerSoft: '#FBE7E7',
  white: '#FFFFFF',
  badgeBg: '#ECE8FF', // lavender count badge
  badgeText: '#7A6FF0',
};

// Warm cream background gradient, top → bottom.
export const bgGradient = [colors.bgTop, colors.bgBottom] as const;
// Gold selection / hero gradient.
export const goldGradient = ['#F7DD9C', '#E7B645'] as const;

export const radius = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#7A6A3F',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  // Deep shadow for the black primary buttons.
  button: {
    shadowColor: '#15130E',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
