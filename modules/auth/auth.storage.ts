import { AuthSession } from "./auth.types";


export const authStorage = {
    session: storage.defineItem<AuthSession>(
        'local:auth::session',
    ),
}