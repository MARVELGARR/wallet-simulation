import { getAllUsers, findUserById, deleteUserById } from "../../data-access-layer/user/user.js";

/**
 * Service to fetch all users.
 */
export const fetchAllUsers = async () => {
    const result = await getAllUsers();
    
    if (!result.success) {
        throw new Error(result.error);
    }
    
    return result.data;
};

/**
 * Service to fetch a single user by ID.
 */
export const fetchUserById = async (id: string) => {
    const result = await findUserById(id);
    
    if (!result.success) {
        throw new Error(result.error);
    }
    
    return result.data;
};

/**
 * Service to delete a user by ID.
 */
export const removeUserById = async (id: string) => {
    const result = await deleteUserById(id);

    if (!result.success) {
        throw new Error(result.error);
    }

    return result.data;
};
