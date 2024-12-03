import { MongoClient } from "mongodb";
import type { UserModel, ProjectModel, TaskModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if(!MONGO_URL) {
  console.error("MONGO_URL not found");
  Deno.exit(1);
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
    
    return new Response("Endpoint not found", {status:404});

  }else if (method==="POST") {
    
    return new Response("Endpoint not found", {status:404});

  }else if (method==="PUT") {
    
    return new Response("Endpoint not found", {status:404});

  }else if (method==="DELETE") {
    
    return new Response("Endpoint not found", {status:404});

  }

  return new Response("Endpoint not found", {status:404});

}

Deno.serve({port:3000}, handler);