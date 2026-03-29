import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://texemtuwxlgiabvjzvyl.supabase.co';
const defaultEmail = 'tpsgreenenterpriseltd@gmail.com';
const defaultName = 'TPS Green Admin';

const supabaseUrl = process.env.SUPABASE_URL || defaultUrl;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || process.argv[2] || defaultEmail;
const adminName = process.env.ADMIN_NAME || process.argv[3] || defaultName;

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY.');
  console.error(
    'Set it in your shell first, then run: npm run set-admin-role -- "tpsgreenenterpriseltd@gmail.com" "TPS Green Admin"'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  const user = data.users.find((entry) => entry.email?.toLowerCase() === adminEmail.toLowerCase());

  if (!user) {
    throw new Error(
      `No Supabase auth user found for ${adminEmail}. Create the user first in Supabase Authentication -> Users.`
    );
  }

  const nextMetadata = {
    ...(user.user_metadata || {}),
    role: 'admin',
    name: adminName,
  };

  const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: nextMetadata,
    email_confirm: true,
  });

  if (updateError) {
    throw new Error(`Failed to update user: ${updateError.message}`);
  }

  console.log('Admin role applied successfully.');
  console.log(`Email: ${updated.user.email}`);
  console.log(`User ID: ${updated.user.id}`);
  console.log(`Metadata: ${JSON.stringify(updated.user.user_metadata, null, 2)}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
