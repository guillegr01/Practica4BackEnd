import type { Collection } from "mongodb";
import type { User, Project, Task } from "./types.ts";
import type { UserModel, ProjectModel, TaskModel } from "./types.ts";

export const fromModelToUser = (um: UserModel): User => {
    return {
        id: um._id!.toString(),
        name: um.name,
        email: um.email,
        created_at: um.created_at,
    }
}

export const fromModelToProject = (pm: ProjectModel, um: UserModel): Project => {
    return {
        id: pm._id!.toString(),
        name: pm.name,
        start_date: pm.start_date,
        end_date: pm.end_date,
        user_id: um._id!.toString(),
    }
}

export const fromModelToTask = (tm: TaskModel, pm:ProjectModel): Task => {
    return {
        id: tm._id!.toString(),
        title: tm.title,
        description: tm.description,
        status: tm.status,
        created_at: tm.created_at,
        due_date: tm.due_date,
        project_id: pm._id!.toString(),
    }
}