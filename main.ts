import { MongoClient, ObjectId } from "mongodb";
import type { UserModel, ProjectModel, TaskModel } from "./types.ts";
import { fromModelToProject, fromModelToUser } from "./utils.ts";
import { fromModelToTask } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if(!MONGO_URL) {
  console.error("MONGO_URL not found");
  throw Error("Enter a valid MONGO_URL");
}

const client = new MongoClient(MONGO_URL);
await client.connect();

console .info("Connected succesfully to server");

const db = client.db("BBDD_P4");
const UserCollection = db.collection<UserModel>("users");
const ProjectCollection = db.collection<ProjectModel>("project");
const TaskCollection = db.collection<TaskModel>("task");

const handler = async (req: Request): Promise<Response> => {

  const method = req.method;
  const url = new URL(req.url);

  const path = url.pathname;
  const searchParams = url.searchParams;

  if (method==="GET") {
    
    if (path==="/users") {
      const usersDB = await UserCollection.find().toArray();
      if(usersDB.length===0) return new Response("There´s no Users in the DDBB", {status:404});
      const users = usersDB.map((um:UserModel) => {
        return fromModelToUser(um);
      })

      return new Response(JSON.stringify(users));

    }else if (path==="/projects") {
      const projectsDB = await ProjectCollection.find().toArray();
      const usersDB = await UserCollection.find().toArray();
      if(projectsDB.length===0 || usersDB.length===0) return new Response("There´s no Projects or Users in the DDBB", {status:404});
 
      try {

        const projects = projectsDB.map((pm:ProjectModel) => {
        
          const projectOwner = usersDB.find((um:UserModel) => {
            if (um._id?.toString() === pm.user_id.toString()) {
              return um;
            }
          });
  
          if(projectOwner===undefined) {
            throw Error(`User not found with the specified project user_id: ${pm.user_id.toString()}`);
          };
  
          return fromModelToProject(pm, projectOwner);
  
        });

        return new Response(JSON.stringify(projects));

      }catch(_error) {
        return new Response("Internal Server Error", { status: 500 });
      }
    
    }else if (path==="/tasks") {
      const tasksDB = await TaskCollection.find().toArray();
      const projectsDB = await ProjectCollection.find().toArray();
      if(tasksDB.length===0||projectsDB.length===0) return new Response("Ther´s no Tasks os Projects in the DDBB", {status:404});

      try {
        
        const tasks = tasksDB.map((tm:TaskModel) => {
          
          const taskOwner = projectsDB.find((pm:ProjectModel) => {
            return pm._id?.toString()===tm.project_id.toString();
          });

          if(taskOwner===undefined) {
            throw Error(`Project not found with the specified task project_id: ${tm.project_id.toString()}`);
          }

          return fromModelToTask(tm, taskOwner);

        });

        return new Response(JSON.stringify(tasks));

      } catch (_error) {
        return new Response("Internal Server Error", { status: 500 });
      }

    }

  }else if (method==="POST") {

    if (path==="/users") {
      const newUser = await req.json();
      if(!newUser.name || !newUser.email) return new Response("Bad Request", {status:404});

      const { insertedId } = await UserCollection.insertOne({
        name: newUser.name,
        email: newUser.email,
        created_at: new Date()
      }); 

      return new Response(JSON.stringify({
        id: insertedId,
        name: newUser.name,
        email: newUser.email,
        created_at: new Date()  //no podría poner created_at: newUser.created_at ya que ese valor no viene en el body de entrada
      }), {status:201});

    }else if (path==="/projects") {
      const newProject = await req.json();
      if(!newProject.name||!newProject.start_date||!newProject.user_id) return new Response("Bad Request", {status:400});

      const user_id_DDBB = new ObjectId(newProject.user_id as string);
      const userExistsOnDDBB = await UserCollection.findOne({_id: user_id_DDBB});
      if(!userExistsOnDDBB)return new Response("User ID not found", {status:404});

      const { insertedId } = await ProjectCollection.insertOne({
        name: newProject.name,
        description: newProject.description ? newProject.description:undefined,
        start_date: new Date(newProject.start_date),
        end_date: newProject.end_date ? new Date(newProject.end_date):undefined,
        user_id: user_id_DDBB
      });

      return new Response(JSON.stringify({
        id: insertedId,
        name: newProject.name,
        description: newProject.description,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        user_id: newProject.user_id
      }), {status:201});

    }else if (path==="/tasks") {
      
      const newTask = await req.json();
      if(!newTask.title||!newTask.project_id) return new Response("Bad Request: title and project_id params are required", {status:400});

      const project_id_DDBB = new ObjectId(newTask.project_id as string);
      const projectExistsOnDDBB = await ProjectCollection.findOne({_id: project_id_DDBB});
      if(!projectExistsOnDDBB) return new Response("Project ID not found", {status:404});

      const { insertedId } = await TaskCollection.insertOne({
        title: newTask.title,
        description: newTask.description ? newTask.description:undefined,
        status: 'pending',
        created_at: new Date(),
        due_date: newTask.due_date ? new Date(newTask.due_date):undefined,
        project_id: project_id_DDBB
      });

      return new Response(JSON.stringify({
        id: insertedId,
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
        created_at: new Date(),
        due_date: newTask.due_date,
        project_id: newTask.project_id
      }), {status:201});

    }

  }else if (method==="PUT") {
    
    return new Response("Endpoint not found", {status:404});

  }else if (method==="DELETE") {

    if (path==="/users") {
      const id = searchParams.get("id");
      if(!id) return new Response("Bad request: param ID is required", {status:400});

      const { deletedCount } = await UserCollection.deleteOne({ _id: new ObjectId(id)})
      if(deletedCount===0) return new Response("User not found in the DDBB", {status:404});

      return new Response("User deleted succesfully");

    }else if(path==="/projects") {

      const id = searchParams.get("id");
      if(!id) return new Response("Bad Request: param ID is required", {status:400});

      const { deletedCount } = await ProjectCollection.deleteOne({_id: new ObjectId(id)});
      if(deletedCount===0) return new Response("Project not found in the DDBBB", {status:404});

      return new Response("Project deleted successfully");

    }
    
  }

  return new Response("Endpoint not found", {status:404});

}

Deno.serve({port:3000}, handler);