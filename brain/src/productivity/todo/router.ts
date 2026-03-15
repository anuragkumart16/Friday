import { Router } from "express";
import {
    createCollection,
    getCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    hideCollection,
    batchCollectionAction,
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
    hideTodo,
    batchTodoAction,
    createCollectionWithTodos,
} from "./controller";

/**
 * Todo Router.
 *
 * Defines all routes for TodoCollection and Todo CRUD,
 * hide/unhide, batch operations, and combined creation.
 */
const router = Router();


// ─── Collection Routes ───────────────────────

// Batch operations (must be before :id routes to avoid conflict)
router.route("/collections/batch").post(batchCollectionAction);

// CRUD
router.route("/collections").get(getCollections).post(createCollection);
router.route("/collections/:id").get(getCollectionById).patch(updateCollection).delete(deleteCollection);

// Hide / Unhide
router.route("/collections/:id/hide").patch(hideCollection);


// ─── Todo Routes ─────────────────────────────

// Batch operations (must be before :id routes to avoid conflict)
router.route("/todos/batch").post(batchTodoAction);

// CRUD
router.route("/todos").get(getTodos).post(createTodo);
router.route("/todos/:id").get(getTodoById).patch(updateTodo).delete(deleteTodo);

// Hide / Unhide
router.route("/todos/:id/hide").patch(hideTodo);


// ─── Combined ────────────────────────────────

// Create collection with todos in one shot
router.route("/collections-with-todos").post(createCollectionWithTodos);


export default router;
