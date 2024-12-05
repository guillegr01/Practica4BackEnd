import { MongoClient, ObjectId } from "mongodb";
import type { UserModel, ProjectModel, TaskModel } from "./types.ts";
import { fromModelToProject, fromModelToUser } from "./utils.ts";

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
      const projects = projectsDB.map((pm:ProjectModel) => {
        usersDB.find((um:UserModel) => {
          if (um._id===pm.user_id) {
            return fromModelToProject(pm,um);
          }
        })
      });

      return new Response(JSON.stringify(projects));
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
        created_at: new Date()
      }), {status:201});

    }else if (path==="/projects") {
      const newProject = await req.json();
      if(!newProject.name||!newProject.start_date||!newProject.user_id) return new Response("Bad Request", {status:400});

      const user_id_DDBB = new ObjectId(newProject.user_id);
      const userExistsOnDDBB = await UserCollection.findOne({_id: user_id_DDBB});
      if(!userExistsOnDDBB)return new Response("User ID not found", {status:404});

      const { insertedId } = await ProjectCollection.insertOne({
        name: newProject.name,
        description: newProject.description,
        start_date: new Date(newProject.start_date),
        end_date: new Date(newProject.end_date),
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
    }
    
    return new Response("Endpoint not found", {status:404});

  }

  return new Response("Endpoint not found", {status:404});

}

Deno.serve({port:3000}, handler);