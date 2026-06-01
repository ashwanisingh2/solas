/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db/prisma";
import fs from "fs";
import path from "path";

// Path to the fallback JSON file
const FALLBACK_FILE_PATH = path.join(process.cwd(), "src", "lib", "mock_db_store.json");

// Helper to read the fallback JSON file
function readFallbackDb(): { users: any[]; incidentSessions: any[] } {
  try {
    if (!fs.existsSync(FALLBACK_FILE_PATH)) {
      const initial = {
        users: [
          {
            id: "default-student-id",
            supabaseId: "mock-supabase-student-id",
            email: "student@guruai.local",
            name: "Aarav Patel",
            roles: ["STUDENT"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        incidentSessions: [],
      };
      fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = fs.readFileSync(FALLBACK_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading fallback JSON DB:", error);
    return { users: [], incidentSessions: [] };
  }
}

// Helper to write the fallback JSON file
function writeFallbackDb(data: { users: any[]; incidentSessions: any[] }) {
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing fallback JSON DB:", error);
  }
}

let isDbReachable: boolean | null = null;

// Self-test database connection on start
async function checkDbConnection(): Promise<boolean> {
  if (isDbReachable !== null) return isDbReachable;
  try {
    // Quick probe to check connection
    await prisma.$queryRaw`SELECT 1`;
    isDbReachable = true;
    console.log("Database connection successful. Using PostgreSQL.");
    return true;
  } catch {
    isDbReachable = false;
    console.warn("Database connection failed. Falling back to local JSON database store.");
    return false;
  }
}

export const dbService = {
  user: {
    findFirst: async () => {
      const useRealDb = await checkDbConnection();
      if (useRealDb) {
        try {
          return await prisma.user.findFirst();
        } catch {
          isDbReachable = false; // Flag fallback
        }
      }
      const data = readFallbackDb();
      return data.users[0] || null;
    },
    create: async (args: { data: any }) => {
      const useRealDb = await checkDbConnection();
      if (useRealDb) {
        try {
          return await prisma.user.create(args);
        } catch {
          isDbReachable = false;
        }
      }
      const data = readFallbackDb();
      const newUser = {
        id: args.data.id || `usr_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...args.data,
      };
      data.users.push(newUser);
      writeFallbackDb(data);
      return newUser;
    },
  },
  incidentSession: {
    create: async (args: { data: any }) => {
      const useRealDb = await checkDbConnection();
      if (useRealDb) {
        try {
          return await prisma.incidentSession.create(args);
        } catch (error) {
          console.error("Failed creating session in real DB, reverting to mock:", error);
          isDbReachable = false;
        }
      }
      const data = readFallbackDb();
      const newSession = {
        id: `sess_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...args.data,
      };
      data.incidentSessions.push(newSession);
      writeFallbackDb(data);
      return newSession;
    },
    findMany: async (args?: { where?: any; orderBy?: any }) => {
      const useRealDb = await checkDbConnection();
      if (useRealDb) {
        try {
          return await prisma.incidentSession.findMany(args);
        } catch {
          isDbReachable = false;
        }
      }
      const data = readFallbackDb();
      let results = [...data.incidentSessions];
      if (args?.where) {
        const filters = args.where;
        results = results.filter((s) => {
          for (const key in filters) {
            if (filters[key] !== undefined && s[key] !== filters[key]) {
              return false;
            }
          }
          return true;
        });
      }
      if (args?.orderBy?.createdAt === "desc") {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return results;
    },
    findUnique: async (args: { where: { id: string } }) => {
      const useRealDb = await checkDbConnection();
      if (useRealDb) {
        try {
          return await prisma.incidentSession.findUnique(args);
        } catch {
          isDbReachable = false;
        }
      }
      const data = readFallbackDb();
      return data.incidentSessions.find((s) => s.id === args.where.id) || null;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const useRealDb = await checkDbConnection();
      if (useRealDb) {
        try {
          return await prisma.incidentSession.update(args);
        } catch {
          isDbReachable = false;
        }
      }
      const data = readFallbackDb();
      const idx = data.incidentSessions.findIndex((s) => s.id === args.where.id);
      if (idx === -1) {
        throw new Error(`Incident session with id ${args.where.id} not found.`);
      }
      
      const original = data.incidentSessions[idx];
      const updated = {
        ...original,
        ...args.data,
        updatedAt: new Date().toISOString(),
      };
      
      data.incidentSessions[idx] = updated;
      writeFallbackDb(data);
      return updated;
    },
  },
};
