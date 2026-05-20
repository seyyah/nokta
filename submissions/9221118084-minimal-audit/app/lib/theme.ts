// Lightweight design system shared across screens.

export const colors = {
  bg: '#F6F6FB',
  surface: '#FFFFFF',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: '#191933',
  textMuted: '#8C8CA6',
  border: '#ECECF4',
  danger: '#F43F5E',
  dangerSoft: '#FFE9EE',
  white: '#FFFFFF',
};

// Indigo → violet, used on the FAB and primary actions.
export const primaryGradient = ['#6366F1', '#8B5CF6'] as const;

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#1B1B3A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#4338CA',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

// A small palette so each note card gets a stable accent color.
const accents = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export function accentFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return accents[h % accents.length];
}

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
