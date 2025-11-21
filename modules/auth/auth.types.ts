export type AuthSession = {
    access_token: string;
    refresh_token: string;
    user: AuthUser;
    auth_type: string;
}

export type AuthUser = {
    id: string;
    email: string;
    center_id: string;
    user_type: 'clinician' | 'internal' | 'admin';
    last_sign_in_at: string | null;
    display_consent_form: boolean;
    display_new_ui: boolean;
}