"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BRAIN_API_URL || "http://localhost:5002";

// ─── Types ───────────────────────────────────
interface Todo {
    id: string;
    heading: string;
    description: string | null;
    deadline: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    comment: string | null;
    hidden: boolean;
    collectionId: string;
    createdAt: string;
    updatedAt: string;
}

interface TodoCollection {
    id: string;
    name: string;
    description: string | null;
    deadline: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    comment: string | null;
    hidden: boolean;
    todos: Todo[];
    createdAt: string;
    updatedAt: string;
}

type ModalMode = "createCollection" | "editCollection" | "createTodo" | "editTodo" | "createCollectionWithTodos" | null;

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

// ─── Helpers ─────────────────────────────────
function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatLabel(str: string) {
    return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Component ───────────────────────────────
export default function TodoManager() {
    const [collections, setCollections] = useState<TodoCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHidden, setShowHidden] = useState(false);
    const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
    const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
    const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editTarget, setEditTarget] = useState<TodoCollection | Todo | null>(null);
    const [editCollectionId, setEditCollectionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [filterPriority, setFilterPriority] = useState<string>("ALL");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");

    // Form states
    const [formName, setFormName] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formDeadline, setFormDeadline] = useState("");
    const [formStatus, setFormStatus] = useState<string>("PENDING");
    const [formPriority, setFormPriority] = useState<string>("MEDIUM");
    const [formHeading, setFormHeading] = useState("");
    const [formComment, setFormComment] = useState("");
    const [formBulkTodos, setFormBulkTodos] = useState<Array<{ heading: string; description: string; priority: string }>>([
        { heading: "", description: "", priority: "MEDIUM" },
    ]);

    // ─── Fetch ─────────────────────────────
    const fetchCollections = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            params.set("includeHidden", String(showHidden));
            if (searchQuery.trim()) params.set("q", searchQuery.trim());
            if (filterStatus !== "ALL") params.set("status", filterStatus);
            if (createdFrom) params.set("createdFrom", createdFrom);
            if (createdTo) params.set("createdTo", createdTo);

            const hasFilters = searchQuery.trim() || filterStatus !== "ALL" || createdFrom || createdTo;
            const endpoint = hasFilters
                ? `${API_BASE}/api/productivity/todo/collections/search`
                : `${API_BASE}/api/productivity/todo/collections`;

            const res = await fetch(`${endpoint}?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                // If priority filter is active, filter todos client-side (priority is a todo field)
                if (filterPriority !== "ALL") {
                    const filtered = data.data.map((col: TodoCollection) => ({
                        ...col,
                        todos: col.todos.filter((t: Todo) => t.priority === filterPriority),
                    }));
                    setCollections(filtered);
                } else {
                    setCollections(data.data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch collections", err);
            setError("Failed to connect to the brain service");
        } finally {
            setLoading(false);
        }
    }, [showHidden, searchQuery, filterStatus, filterPriority, createdFrom, createdTo]);

    // Debounced fetch for search input
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchCollections();
        }, searchQuery ? 400 : 0);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [fetchCollections, searchQuery]);

    // ─── Reset Form ────────────────────────
    const resetForm = () => {
        setFormName("");
        setFormDescription("");
        setFormDeadline("");
        setFormStatus("PENDING");
        setFormPriority("MEDIUM");
        setFormHeading("");
        setFormComment("");
        setFormBulkTodos([{ heading: "", description: "", priority: "MEDIUM" }]);
        setEditTarget(null);
        setEditCollectionId(null);
    };

    const openModal = (mode: ModalMode) => {
        resetForm();
        setModalMode(mode);
        setError(null);
    };

    const closeModal = () => {
        setModalMode(null);
        resetForm();
        setError(null);
    };

    // ─── Collection CRUD ───────────────────
    const handleCreateCollection = async () => {
        if (!formName.trim()) { setError("Name is required"); return; }
        try {
            const res = await fetch(`${API_BASE}/api/productivity/todo/collections`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formName,
                    description: formDescription || undefined,
                    deadline: formDeadline || undefined,
                    status: formStatus,
                    comment: formComment || undefined,
                }),
            });
            const data = await res.json();
            if (data.success) { closeModal(); fetchCollections(); }
            else setError(data.message);
        } catch { setError("Request failed"); }
    };

    const handleEditCollection = async () => {
        if (!editTarget) return;
        try {
            const res = await fetch(`${API_BASE}/api/productivity/todo/collections/${editTarget.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formName,
                    description: formDescription,
                    deadline: formDeadline || null,
                    status: formStatus,
                    comment: formComment,
                }),
            });
            const data = await res.json();
            if (data.success) { closeModal(); fetchCollections(); }
            else setError(data.message);
        } catch { setError("Request failed"); }
    };

    const handleDeleteCollection = async (id: string) => {
        if (!confirm("Delete this collection and all its todos?")) return;
        try {
            await fetch(`${API_BASE}/api/productivity/todo/collections/${id}`, { method: "DELETE" });
            fetchCollections();
        } catch { setError("Delete failed"); }
    };

    const handleToggleHideCollection = async (id: string, hidden: boolean) => {
        try {
            await fetch(`${API_BASE}/api/productivity/todo/collections/${id}/hide`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hidden }),
            });
            fetchCollections();
        } catch { setError("Action failed"); }
    };

    // ─── Todo CRUD ─────────────────────────
    const handleCreateTodo = async () => {
        if (!formHeading.trim()) { setError("Heading is required"); return; }
        try {
            const res = await fetch(`${API_BASE}/api/productivity/todo/todos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    collectionId: editCollectionId,
                    heading: formHeading,
                    description: formDescription || undefined,
                    deadline: formDeadline || undefined,
                    status: formStatus,
                    priority: formPriority,
                    comment: formComment || undefined,
                }),
            });
            const data = await res.json();
            if (data.success) { closeModal(); fetchCollections(); }
            else setError(data.message);
        } catch { setError("Request failed"); }
    };

    const handleEditTodo = async () => {
        if (!editTarget) return;
        try {
            const res = await fetch(`${API_BASE}/api/productivity/todo/todos/${editTarget.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    heading: formHeading,
                    description: formDescription,
                    deadline: formDeadline || null,
                    status: formStatus,
                    priority: formPriority,
                    comment: formComment,
                }),
            });
            const data = await res.json();
            if (data.success) { closeModal(); fetchCollections(); }
            else setError(data.message);
        } catch { setError("Request failed"); }
    };

    const handleDeleteTodo = async (id: string) => {
        if (!confirm("Delete this todo?")) return;
        try {
            await fetch(`${API_BASE}/api/productivity/todo/todos/${id}`, { method: "DELETE" });
            fetchCollections();
        } catch { setError("Delete failed"); }
    };

    const handleToggleHideTodo = async (id: string, hidden: boolean) => {
        try {
            await fetch(`${API_BASE}/api/productivity/todo/todos/${id}/hide`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hidden }),
            });
            fetchCollections();
        } catch { setError("Action failed"); }
    };

    // ─── Batch Operations ──────────────────
    const handleBatchCollectionAction = async (action: string) => {
        const ids = Array.from(selectedCollections);
        if (ids.length === 0) return;
        if (action === "delete" && !confirm(`Delete ${ids.length} collection(s)?`)) return;
        try {
            await fetch(`${API_BASE}/api/productivity/todo/collections/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids, action }),
            });
            setSelectedCollections(new Set());
            fetchCollections();
        } catch { setError("Batch action failed"); }
    };

    const handleBatchTodoAction = async (action: string) => {
        const ids = Array.from(selectedTodos);
        if (ids.length === 0) return;
        if (action === "delete" && !confirm(`Delete ${ids.length} todo(s)?`)) return;
        try {
            await fetch(`${API_BASE}/api/productivity/todo/todos/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids, action }),
            });
            setSelectedTodos(new Set());
            fetchCollections();
        } catch { setError("Batch action failed"); }
    };

    // ─── Create Collection With Todos ──────
    const handleCreateCollectionWithTodos = async () => {
        if (!formName.trim()) { setError("Collection name is required"); return; }
        const validTodos = formBulkTodos.filter((t) => t.heading.trim());
        if (validTodos.length === 0) { setError("At least one todo with a heading is required"); return; }
        try {
            const res = await fetch(`${API_BASE}/api/productivity/todo/collections-with-todos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formName,
                    description: formDescription || undefined,
                    deadline: formDeadline || undefined,
                    status: formStatus,
                    comment: formComment || undefined,
                    todos: validTodos.map((t) => ({
                        heading: t.heading,
                        description: t.description || undefined,
                        priority: t.priority,
                    })),
                }),
            });
            const data = await res.json();
            if (data.success) { closeModal(); fetchCollections(); }
            else setError(data.message);
        } catch { setError("Request failed"); }
    };

    // ─── Open Edit Modals ──────────────────
    const openEditCollection = (col: TodoCollection) => {
        setEditTarget(col);
        setFormName(col.name);
        setFormDescription(col.description || "");
        setFormDeadline(col.deadline ? col.deadline.split("T")[0] : "");
        setFormStatus(col.status);
        setFormComment(col.comment || "");
        setModalMode("editCollection");
    };

    const openEditTodo = (todo: Todo) => {
        setEditTarget(todo);
        setFormHeading(todo.heading);
        setFormDescription(todo.description || "");
        setFormDeadline(todo.deadline ? todo.deadline.split("T")[0] : "");
        setFormStatus(todo.status);
        setFormPriority(todo.priority);
        setFormComment(todo.comment || "");
        setModalMode("editTodo");
    };

    const openCreateTodo = (collectionId: string) => {
        resetForm();
        setEditCollectionId(collectionId);
        setModalMode("createTodo");
    };

    // ─── Selection Helpers ─────────────────
    const toggleCollectionSelection = (id: string) => {
        setSelectedCollections((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleTodoSelection = (id: string) => {
        setSelectedTodos((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ─── Bulk Todo Form Helpers ────────────
    const addBulkTodo = () => {
        setFormBulkTodos([...formBulkTodos, { heading: "", description: "", priority: "MEDIUM" }]);
    };
    const removeBulkTodo = (index: number) => {
        setFormBulkTodos(formBulkTodos.filter((_, i) => i !== index));
    };
    const updateBulkTodo = (index: number, field: string, value: string) => {
        setFormBulkTodos(formBulkTodos.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
    };

    const hasActiveFilters = searchQuery || filterStatus !== "ALL" || filterPriority !== "ALL" || createdFrom || createdTo;

    // ─── Render ────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showHidden}
                            onChange={(e) => setShowHidden(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        Show hidden
                    </label>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => openModal("createCollection")}
                        className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
                    >
                        + New Collection
                    </button>
                    <button
                        onClick={() => openModal("createCollectionWithTodos")}
                        className="px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
                    >
                        + Collection with Todos
                    </button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search collections and todos..."
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                    <option value="ALL">All Statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatLabel(s)}</option>
                    ))}
                </select>
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                    <option value="ALL">All Priorities</option>
                    {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                {hasActiveFilters && (
                    <button
                        onClick={() => { setSearchQuery(""); setFilterStatus("ALL"); setFilterPriority("ALL"); setCreatedFrom(""); setCreatedTo(""); }}
                        className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                        Clear filters
                    </button>
                )}
            </div>
            {/* Date Range Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Created from</label>
                    <input
                        type="date"
                        value={createdFrom}
                        onChange={(e) => setCreatedFrom(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Created to</label>
                    <input
                        type="date"
                        value={createdTo}
                        onChange={(e) => setCreatedTo(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Batch Actions for Collections */}
            {selectedCollections.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        {selectedCollections.size} selected
                    </span>
                    <div className="flex flex-wrap gap-2 ml-auto">
                        <button onClick={() => handleBatchCollectionAction("hide")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Hide</button>
                        <button onClick={() => handleBatchCollectionAction("unhide")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Unhide</button>
                        <button onClick={() => handleBatchCollectionAction("delete")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Delete</button>
                    </div>
                </div>
            )}

            {/* Batch Actions for Todos */}
            {selectedTodos.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {selectedTodos.size} selected
                    </span>
                    <div className="flex flex-wrap gap-2 ml-auto">
                        <button onClick={() => handleBatchTodoAction("hide")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Hide</button>
                        <button onClick={() => handleBatchTodoAction("unhide")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Unhide</button>
                        <button onClick={() => handleBatchTodoAction("delete")} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Delete</button>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && !modalMode && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-sm text-red-700 dark:text-red-300 flex justify-between items-center">
                    {error}
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            )}

            {/* No Results from Filters */}
            {!loading && collections.length === 0 && hasActiveFilters && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No results found</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && collections.length === 0 && !hasActiveFilters && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No collections yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Create your first collection to start organizing todos.</p>
                </div>
            )}

            {/* Collections List */}
            {!loading && collections.map((col) => (
                <div
                    key={col.id}
                    className={`rounded-2xl border transition-all ${col.hidden ? "opacity-60 border-dashed border-gray-300 dark:border-gray-700" : "border-gray-200 dark:border-gray-800"} bg-white dark:bg-gray-900 shadow-sm overflow-hidden`}
                >
                    {/* Collection Header */}
                    <div className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3">
                        <input
                            type="checkbox"
                            checked={selectedCollections.has(col.id)}
                            onChange={() => toggleCollectionSelection(col.id)}
                            className="mt-1.5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => setExpandedCollection(expandedCollection === col.id ? null : col.id)}
                        >
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{col.name}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[col.status]}`}>
                                    {formatLabel(col.status)}
                                </span>
                                {col.hidden && (
                                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Hidden</span>
                                )}
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                                    {col.todos.length} todo{col.todos.length !== 1 ? "s" : ""}
                                </span>
                                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCollection === col.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {col.description && <p className="text-sm text-gray-500 dark:text-gray-400">{col.description}</p>}
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {col.deadline && <span>Deadline: {formatDate(col.deadline)}</span>}
                                {col.comment && <span>💬 {col.comment}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                            <button
                                onClick={() => openCreateTodo(col.id)}
                                className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                                title="Add Todo"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                            <button
                                onClick={() => openEditCollection(col)}
                                className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                                title="Edit"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button
                                onClick={() => handleToggleHideCollection(col.id, !col.hidden)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                                title={col.hidden ? "Unhide" : "Hide"}
                            >
                                {col.hidden ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </button>
                            <button
                                onClick={() => handleDeleteCollection(col.id)}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                                title="Delete"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Expanded Todos */}
                    {expandedCollection === col.id && (
                        <div className="border-t border-gray-100 dark:border-gray-800">
                            {col.todos.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                                    No todos in this collection.{" "}
                                    <button onClick={() => openCreateTodo(col.id)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Create one
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {col.todos.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className={`p-3 sm:p-4 pl-4 sm:pl-12 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${todo.hidden ? "opacity-50" : ""}`}
                                        >
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedTodos.has(todo.id)}
                                                onChange={() => toggleTodoSelection(todo.id)}
                                                className="mt-1 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`font-semibold text-sm ${todo.status === "COMPLETED" ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                                                        {todo.heading}
                                                    </span>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[todo.status]}`}>
                                                        {formatLabel(todo.status)}
                                                    </span>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLORS[todo.priority]}`}>
                                                        {todo.priority}
                                                    </span>
                                                    {todo.hidden && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-500">Hidden</span>
                                                    )}
                                                </div>
                                                {todo.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{todo.description}</p>}
                                                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                                    {todo.deadline && <span>Due: {formatDate(todo.deadline)}</span>}
                                                    {todo.comment && <span>💬 {todo.comment}</span>}
                                                </div>
                                            </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                                                <button onClick={() => openEditTodo(todo)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-colors" title="Edit">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleToggleHideTodo(todo.id, !todo.hidden)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors" title={todo.hidden ? "Unhide" : "Hide"}>
                                                    {todo.hidden ? (
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    )}
                                                </button>
                                                <button onClick={() => handleDeleteTodo(todo.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* ─── Modal Overlay ─────────────────── */}
            {modalMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 sm:p-5 flex justify-between items-center rounded-t-2xl z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {modalMode === "createCollection" && "New Collection"}
                                {modalMode === "editCollection" && "Edit Collection"}
                                {modalMode === "createTodo" && "New Todo"}
                                {modalMode === "editTodo" && "Edit Todo"}
                                {modalMode === "createCollectionWithTodos" && "New Collection with Todos"}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            {/* Collection Fields */}
                            {(modalMode === "createCollection" || modalMode === "editCollection" || modalMode === "createCollectionWithTodos") && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Collection name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                        <textarea
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Optional description"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                                            <input
                                                type="date"
                                                value={formDeadline}
                                                onChange={(e) => setFormDeadline(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                            <select
                                                value={formStatus}
                                                onChange={(e) => setFormStatus(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{formatLabel(s)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment</label>
                                        <input
                                            type="text"
                                            value={formComment}
                                            onChange={(e) => setFormComment(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Optional comment"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Todo Fields */}
                            {(modalMode === "createTodo" || modalMode === "editTodo") && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading *</label>
                                        <input
                                            type="text"
                                            value={formHeading}
                                            onChange={(e) => setFormHeading(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Todo heading"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                        <textarea
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Optional description"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                                            <input
                                                type="date"
                                                value={formDeadline}
                                                onChange={(e) => setFormDeadline(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                            <select
                                                value={formStatus}
                                                onChange={(e) => setFormStatus(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{formatLabel(s)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                            <select
                                                value={formPriority}
                                                onChange={(e) => setFormPriority(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            >
                                                {PRIORITY_OPTIONS.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment</label>
                                        <input
                                            type="text"
                                            value={formComment}
                                            onChange={(e) => setFormComment(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Optional comment"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Bulk Todos for createCollectionWithTodos */}
                            {modalMode === "createCollectionWithTodos" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Todos</label>
                                        <button
                                            type="button"
                                            onClick={addBulkTodo}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                        >
                                            + Add another
                                        </button>
                                    </div>
                                    {formBulkTodos.map((todo, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={todo.heading}
                                                    onChange={(e) => updateBulkTodo(idx, "heading", e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                                    placeholder="Todo heading *"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={todo.description}
                                                        onChange={(e) => updateBulkTodo(idx, "description", e.target.value)}
                                                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                                        placeholder="Description"
                                                    />
                                                    <select
                                                        value={todo.priority}
                                                        onChange={(e) => updateBulkTodo(idx, "priority", e.target.value)}
                                                        className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                                    >
                                                        {PRIORITY_OPTIONS.map((p) => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            {formBulkTodos.length > 1 && (
                                                <button
                                                    onClick={() => removeBulkTodo(idx)}
                                                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors mt-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-5 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (modalMode === "createCollection") handleCreateCollection();
                                    else if (modalMode === "editCollection") handleEditCollection();
                                    else if (modalMode === "createTodo") handleCreateTodo();
                                    else if (modalMode === "editTodo") handleEditTodo();
                                    else if (modalMode === "createCollectionWithTodos") handleCreateCollectionWithTodos();
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-sm"
                            >
                                {modalMode?.startsWith("create") ? "Create" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
