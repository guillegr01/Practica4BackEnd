import { ObjectId, type OptionalId } from "mongodb";

export type User = {
    id: string,
    name: string,
    email: string,
    created_at: Date,
};

export type Project = {
    id: string,
    name: string,
    description?: string,
    start_date: Date,
    end_date?: Date,
    user_id: string,
};

export type Task = {
    id: string,
    title: string,
    description?: string,
    status: 'pending' | 'in_progress' | 'completed',
    created_at: Date,
    due_date?: Date,
    project_id: string,
};

export type UserModel = OptionalId<{
    name: string,
    email: string,
    created_at: Date,
}>;

export type ProjectModel = OptionalId<{
    name: string,
    description?: string,
    start_date: Date,
    end_date?: Date,
    user_id: ObjectId,
}>;

export type TaskModel = OptionalId<{
    title: string,
    description?: string,
    status: 'pending' | 'in_progress' | 'completed',
    created_at: Date,
    due_date?: Date,
    project_id: ObjectId,
}>;
