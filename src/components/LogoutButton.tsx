// src/components/LogoutButton.tsx
'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Chiama l'API di logout
    await fetch('/api/logout');
    // Forziamo il reindirizzamento (il middleware lo farebbe comunque, ma è più pulito)
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#FFD700] hover:text-black"
    >
      Esci (Logout)
    </button>
  );
}