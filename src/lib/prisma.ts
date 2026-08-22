//Import our prisma generated schema library
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });


//GlobalThis is a JS Object that can survives across next.js hot reloads during dev.
//We can stash our Client there and reuse the same one everytime the code reloads instead of creating new db connections on every save
//Preventing server exhaustion

								  //TYPE CAST/ASSERTION. (double cast) as X 
								  //unknown TS Script meaning "could be anything" 
								  //{ object type/shape } prisma = key PrismaClient = value
								  //Tagging our prismaClient onto globalThis so we can access it without TS erroring
//globalforPrisma is now a TS approved reference to globalThis allowing access to our primsaClient (TS library schema etc)
const globalforPrisma = globalThis as unknown as { prisma: PrismaClient };

//GlobalforPrisma.prisma is just the global variable globalThis with the prisma property (our client attached)

//exportable variable prisma is either our global variable with our TS client attached 
// OR 
//Construct a new PrismaClient.
export const prisma = globalforPrisma.prisma || new PrismaClient({ adapter });
//IF NOT IN PROD 
if (process.env.NODE_ENV !== "production") globalforPrisma.prisma = prisma;

//Launch - shelf empty - build new client - store it in prisma since in dev and not production - hot reload happens, globalThis survives.


//globalforprisma.prisma is our TS Library with our Schemas attached

//1st run: 
//globalforPrisma.prisma holds no value - so new client is generated = its value is "PRISMA"
//If we're in dev we take "PRISMA" [the newly generated client] and copy it into globalforPrisma.prisma 
//2nd run:
//globalforprisma.prisma now has a value 
//prisma value is now globalforPrisma.prisma reuse client 