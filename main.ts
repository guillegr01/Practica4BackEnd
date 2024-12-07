import { MongoClient, ObjectId } from "mongodb";
import type { UserModel, ProjectModel, TaskModel } from "./types.ts";
import { fromModelToProject, fromModelToTask, fromModelToUser } from "./utils.ts";

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
      if(usersDB.length===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      const users = usersDB.map((um:UserModel) => {
        return fromModelToUser(um);
      });

      return new Response(JSON.stringify(users));

    }else if (path==="/projects") {
      const projectsDB = await ProjectCollection.find().toArray();
      const usersDB = await UserCollection.find().toArray();
      if(projectsDB.length===0 || usersDB.length===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});
 
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
        return new Response(JSON.stringify({
          "error": true,
          "status": 500,
          "message": "An internal server error occurred. Please try again later."
        }), { status: 500 });
      }
    
    }else if (path==="/tasks") {
      const tasksDB = await TaskCollection.find().toArray();
      const projectsDB = await ProjectCollection.find().toArray();

      if(tasksDB.length===0||projectsDB.length===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

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
        return new Response(JSON.stringify({
          "error": true,
          "status": 500,
          "message": "An internal server error occurred. Please try again later."
        }), { status: 500 });
      }

    }else if (path==="/tasks/by-project") {
      
      const project_id_url = searchParams.get("project_id");

      if(!project_id_url) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

      const projectsDB = await ProjectCollection.find().toArray();

      if(projectsDB.length===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      const project_idExists = projectsDB.some((pm:ProjectModel) => {
        return pm._id?.toString()===project_id_url;
      });

      if(project_idExists===false) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      const tasksDBbyProjectID = await TaskCollection.find({project_id: new ObjectId(project_id_url)}).toArray();

      if(tasksDBbyProjectID.length===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      return new Response(JSON.stringify(tasksDBbyProjectID));

    }else if (path==="/projects/by-user") {
      
      const user_id_url = searchParams.get("user_id");
      if(!user_id_url) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

      const usersDB = await UserCollection.find().toArray();

      if(usersDB.length===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      const user_idExists = usersDB.some((um:UserModel) => {
        return um._id?.toString()===user_id_url;
      });

      if(user_idExists===false) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      const projectsDBbyUserID = await ProjectCollection.find({user_id: new ObjectId(user_id_url)}).toArray();

      if(projectsDBbyUserID.length===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      return new Response(JSON.stringify(projectsDBbyUserID));

    }

  }else if (method==="POST") {

    if (path==="/users") {
      const newUser = await req.json();
      if(!newUser.name || !newUser.email) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

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
      if(!newProject.name||!newProject.start_date||!newProject.user_id) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:400});

      const user_id_DDBB = new ObjectId(newProject.user_id as string);
      const userExistsOnDDBB = await UserCollection.findOne({_id: user_id_DDBB});
      if(!userExistsOnDDBB)return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

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
      if(!newTask.title||!newTask.project_id) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

      const project_id_DDBB = new ObjectId(newTask.project_id as string);
      const projectExistsOnDDBB = await ProjectCollection.findOne({_id: project_id_DDBB});
      if(!projectExistsOnDDBB) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

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
        description: newTask.description  ? newTask.description:null,
        status: 'pending',
        created_at: new Date(),
        due_date: newTask.due_date ? newTask.due_date:null,
        project_id: newTask.project_id
      }), {status:201});

    }else if (path==="/tasks/move") {
      
      const taskToMove = await req.json();
      if(!taskToMove.task_id||!taskToMove.destination_project_id) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

      const task_id_DDBB = new ObjectId(taskToMove.task_id as string);
      const taskExistsOnDDBB = await TaskCollection.findOne({_id: task_id_DDBB});
      if(!taskExistsOnDDBB) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      const destination_project_id_DDBB = new ObjectId(taskToMove.destination_project_id as string);
      const destinationProjectExistsOnDDBB = await ProjectCollection.findOne({_id: destination_project_id_DDBB});
      if(!destinationProjectExistsOnDDBB) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      const {modifiedCount} = await TaskCollection.updateOne(
        {_id:task_id_DDBB},
        {$set: {project_id:destination_project_id_DDBB}}
      );

      if(modifiedCount===0) return new Response(JSON.stringify({
        "error": true,
        "status": 500,
        "message": "An internal server error occurred. Please try again later."
      }), {status:500});

      return new Response(JSON.stringify({
        "message": "Task moved successfully.",
        "Task" : {
          id: taskToMove.task_id,
          title: taskExistsOnDDBB.title,
          project_id: taskToMove.destination_project_id
        }
      }), {status:201});

    }

  }else if (method==="DELETE") {

    if (path==="/users") {
      const id = searchParams.get("id");
      if(!id) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

      const { deletedCount } = await UserCollection.deleteOne({ _id: new ObjectId(id)})
      if(deletedCount===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      return new Response("User deleted succesfully");

    }else if(path==="/projects") {

      const id = searchParams.get("id");
      if(!id) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

      const { deletedCount } = await ProjectCollection.deleteOne({_id: new ObjectId(id)});
      if(deletedCount===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      return new Response("Project deleted successfully");

    }else if(path==="/tasks") {

      const id = searchParams.get("id");
      if(!id) return new Response(JSON.stringify({
        "error": true,
        "status": 400,
        "message": "Bad Request."
      }), {status:400});

      const { deletedCount } = await TaskCollection.deleteOne({_id: new ObjectId(id)});
      if(deletedCount===0) return new Response(JSON.stringify({
        "error": true,
        "status": 404,
        "message": "The requested resource was not found."
      }), {status:404});

      return new Response("Task deleted succesfully");

    }
    
  }

  return new Response(JSON.stringify({
    "error": true,
    "status": 404,
    "message": "Endpoint not found." 
  }), {status:404});

}

Deno.serve({port:3000}, handler);