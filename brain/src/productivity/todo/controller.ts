import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma";
import ApiResponse from "../../utils/response.util";
import { logger } from "../../logger/logger";


// ─────────────────────────────────────────────
//  COLLECTION CONTROLLERS
// ─────────────────────────────────────────────

/**
 * Create a new TodoCollection.
 * Body: { name, description?, deadline?, status? }
 */
const createCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, deadline, status } = req.body;

        if (!name) {
            return ApiResponse(res, 400, "Collection name is required");
        }

        const collection = await prisma.todoCollection.create({
            data: {
                name,
                ...(description && { description }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(status && { status }),
            },
        });

        logger.info("Collection created", { collectionId: collection.id });
        return ApiResponse(res, 201, "Collection created successfully", collection);
    } catch (error) {
        next(error);
    }
};


/**
 * Get all collections (optionally include hidden).
 * Query: ?includeHidden=true
 */
const getCollections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const includeHidden = req.query.includeHidden === "true";

        const collections = await prisma.todoCollection.findMany({
            where: includeHidden ? {} : { hidden: false },
            include: { todos: true },
            orderBy: { createdAt: "desc" },
        });

        return ApiResponse(res, 200, "Collections fetched successfully", collections);
    } catch (error) {
        next(error);
    }
};


/**
 * Get a single collection by ID.
 * Params: :id
 * Query: ?includeHiddenTodos=true
 */
const getCollectionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const includeHiddenTodos = req.query.includeHiddenTodos === "true";

        const collection = await prisma.todoCollection.findUnique({
            where: { id },
            include: {
                todos: {
                    where: includeHiddenTodos ? {} : { hidden: false },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!collection) {
            return ApiResponse(res, 404, "Collection not found");
        }

        return ApiResponse(res, 200, "Collection fetched successfully", collection);
    } catch (error) {
        next(error);
    }
};


/**
 * Update a collection.
 * Params: :id
 * Body: { name?, description?, deadline?, status? }
 */
const updateCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { name, description, deadline, status } = req.body;

        const collection = await prisma.todoCollection.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
                ...(status !== undefined && { status }),
            },
        });

        logger.info("Collection updated", { collectionId: collection.id });
        return ApiResponse(res, 200, "Collection updated successfully", collection);
    } catch (error) {
        next(error);
    }
};


/**
 * Delete a collection (and its todos via cascade).
 * Params: :id
 */
const deleteCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        // Delete all todos in the collection first, then the collection
        await prisma.todo.deleteMany({ where: { collectionId: id } });
        await prisma.todoCollection.delete({ where: { id } });

        logger.info("Collection deleted", { collectionId: id });
        return ApiResponse(res, 200, "Collection deleted successfully");
    } catch (error) {
        next(error);
    }
};


/**
 * Toggle hide/unhide a collection.
 * Params: :id
 * Body: { hidden: boolean }
 */
const hideCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { hidden } = req.body;

        if (typeof hidden !== "boolean") {
            return ApiResponse(res, 400, "'hidden' must be a boolean");
        }

        const collection = await prisma.todoCollection.update({
            where: { id },
            data: { hidden },
        });

        logger.info(`Collection ${hidden ? "hidden" : "unhidden"}`, { collectionId: id });
        return ApiResponse(res, 200, `Collection ${hidden ? "hidden" : "unhidden"} successfully`, collection);
    } catch (error) {
        next(error);
    }
};


/**
 * Batch operations on collections.
 * Body: { ids: string[], action: "delete" | "hide" | "unhide" | "updateStatus", status?: TodoStatus }
 */
const batchCollectionAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids, action, status } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return ApiResponse(res, 400, "'ids' must be a non-empty array");
        }

        let result;

        switch (action) {
            case "delete":
                await prisma.todo.deleteMany({ where: { collectionId: { in: ids } } });
                result = await prisma.todoCollection.deleteMany({ where: { id: { in: ids } } });
                break;

            case "hide":
                result = await prisma.todoCollection.updateMany({
                    where: { id: { in: ids } },
                    data: { hidden: true },
                });
                break;

            case "unhide":
                result = await prisma.todoCollection.updateMany({
                    where: { id: { in: ids } },
                    data: { hidden: false },
                });
                break;

            case "updateStatus":
                if (!status) {
                    return ApiResponse(res, 400, "'status' is required for updateStatus action");
                }
                result = await prisma.todoCollection.updateMany({
                    where: { id: { in: ids } },
                    data: { status },
                });
                break;

            default:
                return ApiResponse(res, 400, `Invalid action '${action}'. Must be one of: delete, hide, unhide, updateStatus`);
        }

        logger.info("Batch collection action performed", { action, count: ids.length });
        return ApiResponse(res, 200, `Batch ${action} performed on ${ids.length} collection(s)`, result);
    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────
//  TODO CONTROLLERS
// ─────────────────────────────────────────────

/**
 * Create a new Todo inside a collection.
 * Body: { collectionId, heading, description?, deadline?, status?, priority?, comment? }
 */
const createTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { collectionId, heading, description, deadline, status, priority, comment } = req.body;

        if (!collectionId || !heading) {
            return ApiResponse(res, 400, "'collectionId' and 'heading' are required");
        }

        // Verify collection exists
        const collection = await prisma.todoCollection.findUnique({ where: { id: collectionId } });
        if (!collection) {
            return ApiResponse(res, 404, "Collection not found");
        }

        const todo = await prisma.todo.create({
            data: {
                heading,
                collectionId,
                ...(description && { description }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(status && { status }),
                ...(priority && { priority }),
                ...(comment && { comment }),
            },
        });

        logger.info("Todo created", { todoId: todo.id, collectionId });
        return ApiResponse(res, 201, "Todo created successfully", todo);
    } catch (error) {
        next(error);
    }
};


/**
 * Get all todos (optionally filter by collectionId, includeHidden).
 * Query: ?collectionId=xxx&includeHidden=true
 */
const getTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const collectionId = req.query.collectionId as string | undefined;
        const includeHidden = req.query.includeHidden as string | undefined;

        const where: any = {};
        if (collectionId) where.collectionId = collectionId;
        if (includeHidden !== "true") where.hidden = false;

        const todos = await prisma.todo.findMany({
            where,
            include: { collection: true },
            orderBy: { createdAt: "desc" },
        });

        return ApiResponse(res, 200, "Todos fetched successfully", todos);
    } catch (error) {
        next(error);
    }
};


/**
 * Get a single todo by ID.
 * Params: :id
 */
const getTodoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        const todo = await prisma.todo.findUnique({
            where: { id },
            include: { collection: true },
        });

        if (!todo) {
            return ApiResponse(res, 404, "Todo not found");
        }

        return ApiResponse(res, 200, "Todo fetched successfully", todo);
    } catch (error) {
        next(error);
    }
};


/**
 * Update a todo.
 * Params: :id
 * Body: { heading?, description?, deadline?, status?, priority?, comment? }
 */
const updateTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { heading, description, deadline, status, priority, comment } = req.body;

        const todo = await prisma.todo.update({
            where: { id },
            data: {
                ...(heading !== undefined && { heading }),
                ...(description !== undefined && { description }),
                ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
                ...(status !== undefined && { status }),
                ...(priority !== undefined && { priority }),
                ...(comment !== undefined && { comment }),
            },
        });

        logger.info("Todo updated", { todoId: todo.id });
        return ApiResponse(res, 200, "Todo updated successfully", todo);
    } catch (error) {
        next(error);
    }
};


/**
 * Delete a todo.
 * Params: :id
 */
const deleteTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        await prisma.todo.delete({ where: { id } });

        logger.info("Todo deleted", { todoId: id });
        return ApiResponse(res, 200, "Todo deleted successfully");
    } catch (error) {
        next(error);
    }
};


/**
 * Toggle hide/unhide a todo.
 * Params: :id
 * Body: { hidden: boolean }
 */
const hideTodo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { hidden } = req.body;

        if (typeof hidden !== "boolean") {
            return ApiResponse(res, 400, "'hidden' must be a boolean");
        }

        const todo = await prisma.todo.update({
            where: { id },
            data: { hidden },
        });

        logger.info(`Todo ${hidden ? "hidden" : "unhidden"}`, { todoId: id });
        return ApiResponse(res, 200, `Todo ${hidden ? "hidden" : "unhidden"} successfully`, todo);
    } catch (error) {
        next(error);
    }
};


/**
 * Batch operations on todos.
 * Body: { ids: string[], action: "delete" | "hide" | "unhide" | "updateStatus" | "updatePriority", status?: TodoStatus, priority?: PriorityLevel }
 */
const batchTodoAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids, action, status, priority } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return ApiResponse(res, 400, "'ids' must be a non-empty array");
        }

        let result;

        switch (action) {
            case "delete":
                result = await prisma.todo.deleteMany({ where: { id: { in: ids } } });
                break;

            case "hide":
                result = await prisma.todo.updateMany({
                    where: { id: { in: ids } },
                    data: { hidden: true },
                });
                break;

            case "unhide":
                result = await prisma.todo.updateMany({
                    where: { id: { in: ids } },
                    data: { hidden: false },
                });
                break;

            case "updateStatus":
                if (!status) {
                    return ApiResponse(res, 400, "'status' is required for updateStatus action");
                }
                result = await prisma.todo.updateMany({
                    where: { id: { in: ids } },
                    data: { status },
                });
                break;

            case "updatePriority":
                if (!priority) {
                    return ApiResponse(res, 400, "'priority' is required for updatePriority action");
                }
                result = await prisma.todo.updateMany({
                    where: { id: { in: ids } },
                    data: { priority },
                });
                break;

            default:
                return ApiResponse(res, 400, `Invalid action '${action}'. Must be one of: delete, hide, unhide, updateStatus, updatePriority`);
        }

        logger.info("Batch todo action performed", { action, count: ids.length });
        return ApiResponse(res, 200, `Batch ${action} performed on ${ids.length} todo(s)`, result);
    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────
//  COMBINED: CREATE COLLECTION WITH TODOS
// ─────────────────────────────────────────────

/**
 * Create a new collection along with its todos in a single request.
 * Body: {
 *   name, description?, deadline?, status?,
 *   todos: [{ heading, description?, deadline?, status?, priority?, comment? }]
 * }
 */
const createCollectionWithTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, deadline, status, todos } = req.body;

        if (!name) {
            return ApiResponse(res, 400, "Collection name is required");
        }

        if (!Array.isArray(todos) || todos.length === 0) {
            return ApiResponse(res, 400, "'todos' must be a non-empty array");
        }

        // Validate each todo has a heading
        for (const todo of todos) {
            if (!todo.heading) {
                return ApiResponse(res, 400, "Each todo must have a 'heading'");
            }
        }

        const collection = await prisma.todoCollection.create({
            data: {
                name,
                ...(description && { description }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(status && { status }),
                todos: {
                    create: todos.map((todo: any) => ({
                        heading: todo.heading,
                        ...(todo.description && { description: todo.description }),
                        ...(todo.deadline && { deadline: new Date(todo.deadline) }),
                        ...(todo.status && { status: todo.status }),
                        ...(todo.priority && { priority: todo.priority }),
                        ...(todo.comment && { comment: todo.comment }),
                    })),
                },
            },
            include: { todos: true },
        });

        logger.info("Collection created with todos", {
            collectionId: collection.id,
            todoCount: collection.todos.length,
        });

        return ApiResponse(res, 201, "Collection with todos created successfully", collection);
    } catch (error) {
        next(error);
    }
};


export {
    // Collection
    createCollection,
    getCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    hideCollection,
    batchCollectionAction,

    // Todo
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
    hideTodo,
    batchTodoAction,

    // Combined
    createCollectionWithTodos,
};
