import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

export async function isAdmin() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("is_admin");
    return !error && data === true;
}