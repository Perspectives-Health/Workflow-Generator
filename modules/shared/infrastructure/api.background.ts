import { fastapi } from "@/modules/shared/infrastructure/api-client.background";
import { authStorage } from "@/modules/auth/auth.storage";
import { AuthSession } from "@/modules/auth/auth.types";
import { CreateWorkflowRequest, UpdateCenterRequest, UpdateWorkflowRequest } from "../types";
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

export const refreshToken = async (refreshToken: string) => {
	try {
		const { data, error } = await fastapi.POST(`/refresh`, {
			body: {
				refresh_token: refreshToken,
			}
		});
		if (error) {
			throw error;
		}

		return data;
	} catch (error) {
		console.log('refreshToken error', error)
		throw error;
	}
}


export const getCenterDetails = async (centerId: string) => {
    try {
        const { data, error } = await fastapi.GET(`/centers/{center_id}`, {
            params: {
                path: {
                    center_id: centerId
                }
            }
        });
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Get center details error details:', error);
        throw error;
    }
}

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

export const getEnterprises = async () => {
    try {
        const { data, error } = await fastapi.GET(`/enterprises`);
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Get enterprises error details:', error);
        throw error;
    }
}

export const updateCenterPromptConfig = async (centerId: string, body: UpdateCenterRequest) => {
    try {
        const { data, error } = await fastapi.PUT(`/centers/{center_id}`, {
            params: {
                path: {
                    center_id: centerId
                }
            },
            body: {
                prompt_config: body.prompt_config
            }
        });
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Update center prompt config error details:', error);
        throw error;
    }
}

export const getWorkflows = async ({ centerId, enterpriseId }: { centerId?: string, enterpriseId?: string }) => {
    try {
        const { data, error } = await fastapi.GET(`/workflows`, {
            params: {
                query: {
                    ...(centerId && { center_id: centerId }),
                    ...(enterpriseId && { enterprise_id: enterpriseId }),
                }
            }
        });
        if (error) {
            throw error;
        }
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
            enterprise_id: body.enterprise_id,
            screenshot: body.screenshot,
            category_instructions: body.category_instructions
        }
    });
    if (error) {
        throw error;
    }

    return data.workflow_id;
}

export const getWorkflowMapping = async (workflowId: string) => {
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


export const getWorkflow = async (workflowId: string) => {
    const { data, error } = await fastapi.GET(`/workflows/{workflow_id}`, {
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


export const updateWorkflow = async (body: UpdateWorkflowRequest) => {
    const { data, error } = await fastapi.PUT(`/workflows/{workflow_id}`, {
        params: {
            path: {
                workflow_id: body.workflow_id
            }
        },
        body: {
            workflow_id: body.workflow_id,
            ...(body.name && { name: body.name }),
            ...(body.ignore_flags && { ignore_flags: body.ignore_flags }),
            ...(body.processed_questions && { processed_questions: body.processed_questions }),
            ...(body.prompt_config && { prompt_config: body.prompt_config }),
            ...(body.grouping && { grouping: body.grouping })
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


export const regenerateProcessedQuestion = async (workflowId: string, questionIndex: string) => {
    const { data, error } = await fastapi.POST(`/workflows/{workflow_id}/questions/{question_index}/regenerate`, {
        params: {
            path: {
                workflow_id: workflowId,
                question_index: questionIndex
            }
        }
    });
    if (error) {
        throw error;
    }
    return data;
};


export const createClinicalSession = async () => {
    const { data, error } = await fastapi.POST(`/clinical-sessions`);
    if (error) {
        throw error;
    }

    return data;
}


export const updateClinicalSessionWorkflows = async (sessionId: string, workflowIds: string[]) => {
    const { data, error } = await fastapi.PUT(`/clinical-sessions/{session_id}/workflows`, {
        params: {
            path: {
                session_id: sessionId
            }
        },
        body: {
            workflow_ids: workflowIds
        }
    });
    if (error) {
        throw error;
    }
    return data;
}


export const generateNote = async (sessionId: string, workflowId: string, transcript: string) => {
    const { data, error } = await fastapi.POST(`/populate`, {
        body: {
            session_id: sessionId,
            workflow_id: workflowId,
            transcript: transcript
        }
    });
    if (error) {
        throw error;
    }
    return data;
}


export const getNoteData = async (sessionId: string, workflowId: string) => {
    const { data, error } = await fastapi.GET(`/populate/fill-in-data/{session_id}/{workflow_id}`, {
        params: {
            path: {
                session_id: sessionId,
                workflow_id: workflowId
            }
        }
    });
    if (error) {
        throw error;
    }
    return data;
}