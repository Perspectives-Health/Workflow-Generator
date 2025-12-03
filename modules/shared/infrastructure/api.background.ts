import { fastapi } from "@/modules/shared/infrastructure/api-client.background";
import { authStorage } from "@/modules/auth/auth.storage";
import { AuthSession } from "@/modules/auth/auth.types";
import { CreateWorkflowRequest } from "../types";
// import { CreateWorkflowRequest } from "../types";


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
        const { data, error } = await fastapi.GET(`/centers/`);
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Get centers error details:', error);
        throw error;
    }
}

export const getWorkflows = async (centerId: string) => {
    try {
        const { data, error } = await fastapi.GET(`/workflows/center/{center_id}`, {
            params: {
                path: {
                    center_id: centerId,
                }
            }
        });
        if (error) {
            throw error;
        }
        console.log('data', data);
        return data;
    } catch (error) {
        console.error('Get workflows error details:', error);
        throw error;
    }
}

export const createWorkflow = async (body: CreateWorkflowRequest) => {
    const { data, error } = await fastapi.POST("/workflows", {
        body: {
            workflow_name: body.workflow_name,
            metadata: body.metadata.map(info => ({
                index: info.index,
                xpath: info.xpath,
                // primary_xpath: info.primary_xpath,
                // absolute_xpath: info.absolute_xpath,
                type: info.type,
                label: info.label,
                placeholder: info.placeholder,
                // options: info.options,
            })),
            center_id: body.center_id,
            screenshot: body.screenshot,
            category_instructions: body.category_instructions
        }
    });
    if (error) {
        throw error;
    }

    return data.workflow_id;
}

export const getWorkflowDetails = async (workflowId: string) => {
    const { data, error } = await fastapi.GET(`/workflows/{workflow_id}/form-data`, {
        params: {
            path: {
                workflow_id: workflowId
            }
        }
    });
    if (error) {
        throw error;
    }

    return data;
}


export const updateWorkflow = async (workflowId: string, name?: string, ignoreFlags?: Record<string, boolean>, processedQuestions?: Record<string, string>) => {
    const { data, error } = await fastapi.PUT(`/workflows/{workflow_id}`, {
        params: {
            path: {
                workflow_id: workflowId
            }
        },
        body: {
            workflow_id: workflowId,
            ...(name && { name }),
            ...(ignoreFlags && { ignore_flags: ignoreFlags }),
            ...(processedQuestions && { processed_questions: processedQuestions })
        }
    });
    if (error) {
        throw error;
    }

    // Don't return data - the function signature expects void
}


export const deleteWorkflow = async (workflowId: string) => {
    const { error } = await fastapi.DELETE("/workflows/{workflow_id}", {
        params: {
            path: {
                workflow_id: workflowId
            }
        }
    });
    if (error) {
        throw error;
    }
}


export const saveWorkflowPaths = async (workflowId: string, index: string, xpath: string | undefined, clickBeforeXpaths: string[] | undefined) => {
    const { data, error } = await fastapi.PUT(`/workflows/{workflow_id}/xpaths`, {
        params: {
            path: {
                workflow_id: workflowId
            }
        },
        body: {
            index: index,
            xpath: xpath,
            click_before_xpaths: clickBeforeXpaths
        }
    });
    if (error) {
        throw error;
    }
}
