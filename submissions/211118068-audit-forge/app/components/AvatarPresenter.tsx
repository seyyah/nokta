import { useState } from 'react';
import { AvatarGLB } from './AvatarGLB';
import { AvatarFallback2D } from './AvatarFallback2D';

type Props = {
  mouthOpen: number;
};

export function AvatarPresenter({ mouthOpen }: Props) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return <AvatarFallback2D mouthOpen={mouthOpen} hint={error} />;
  }

  return <AvatarGLB mouthOpen={mouthOpen} onError={setError} />;
}
