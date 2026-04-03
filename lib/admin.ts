import { auth } from "@/lib/supabase/server";

const adminIds: string[] = [
  // Add your Supabase user IDs here
];

export const isAdmin = async () => {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
