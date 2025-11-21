import { fastapi } from "@/modules/shared/infrastructure/api-client.background";
import { authStorage } from "@/modules/auth/auth.storage";
import { AuthSession } from "@/modules/auth/auth.types";


export const login = async ({ email, password }: { email: string; password: string }) => {
	try {
		const { data, error } = await fastapi.POST(`/login`, {
			body: {
				email: email,
				password: password,
			}
		});

		if (error) {
			throw error;
		}

		const authData = data as AuthSession;
		await authStorage.session.setValue(authData);

		return authData;
	} catch (error) {
		console.error('Login error details:', error);
		throw error;
	}
};

export const getCenters = async () => {
    try {
        const { data, error } = await fastapi.GET(`/centers`);
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Get centers error details:', error);
        throw error;
    }
}