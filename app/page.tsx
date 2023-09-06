import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import LogoutButton from '../components/LogoutButton';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect('/login')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="">
      <nav className="">
        <div className="">
          <div />
          <div>
            {user ? (
              <div className="">
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
              redirect('/login')
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}