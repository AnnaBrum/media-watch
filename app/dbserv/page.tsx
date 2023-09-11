import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import LogoutButton from '../../components/LogoutButton/LogoutButton';
import { redirect } from 'next/navigation';
import { HamburgerMenu } from '@/components/HamburgerMenu/HamburgerMenu';
// import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DbServ() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect('/start');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="profile py-8">
      <HamburgerMenu />
      <div className="py-20">
        <h1 className="text-xl font-bold">Välkommen till Media Watch!</h1>
        {user ? (
          <div>
            <p>Hey, {user.email}!</p>
            <LogoutButton />
          </div>
        ) : (
          redirect('/login')
        )}
      </div>
    </div>
  );
}
