import { MongoClient } from "mongodb";
import type { UserModel, ProjectModel, TaskModel } from "./types.ts";
import { fromModelToUser } from "./utils.ts";

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

  if (method==="GET") {
    
    if (path==="/users") {
      const usersDB = await UserCollection.find().toArray();
      if(usersDB.length===0) return new Response("There´s no Users on the DDBB", {status:404});
      const users = usersDB.map((um:UserModel) => {
        return fromModelToUser(um);
      })

      return new Response(JSON.stringify(users));
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

    }

  }else if (method==="PUT") {
    
    return new Response("Endpoint not found", {status:404});

  }else if (method==="DELETE") {
    
    return new Response("Endpoint not found", {status:404});

  }

  return new Response("Endpoint not found", {status:404});

}

Deno.serve({port:3000}, handler);