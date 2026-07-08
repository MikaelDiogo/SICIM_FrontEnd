import { AppRouter } from '@/app/router';
import { Providers } from '@/app/Providers';

export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
