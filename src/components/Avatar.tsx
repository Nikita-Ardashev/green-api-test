import { avatarColor, initials } from '../lib/format';
import { Icon } from './Icon';

export function Avatar({ seed, title, size = 54 }: { seed: string; title: string; size?: number }) {
  const color = avatarColor(seed);
  const letters = initials(title);
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(180deg, color-mix(in srgb, ${color} 75%, white), ${color})`,
      }}
      aria-hidden="true"
    >
      {letters || <Icon name="user" size={Math.round(size * 0.5)} />}
    </div>
  );
}
