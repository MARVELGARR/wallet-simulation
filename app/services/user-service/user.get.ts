import { getAllUsers, findUserById } from "../../data-access-layer/user/user.js";

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
