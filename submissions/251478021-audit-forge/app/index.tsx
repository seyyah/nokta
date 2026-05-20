import { Redirect } from 'expo-router';

// Root index — hemen (tabs) ana sayfasına yönlendir
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
