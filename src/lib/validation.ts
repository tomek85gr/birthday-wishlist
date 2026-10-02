import { z } from "zod";
export const emailSchema=z.email().max(254);
export const slugSchema=z.string().min(3).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const httpUrlSchema=z.url().refine(v=>{try{return ["http:","https:"].includes(new URL(v).protocol)}catch{return false}},"Μη έγκυρος σύνδεσμος");
export const retailerForUrl=(value:string)=>{try{const host=new URL(value).hostname.toLowerCase().replace(/^www\./,"");return host==="skroutz.gr"||host.endsWith(".skroutz.gr")?"skroutz":host==="jumbo.gr"||host.endsWith(".jumbo.gr")?"jumbo":"other" as const}catch{return "other" as const}};
const invitationImageSchema=z.string().max(700_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/);
export const birthdaySchema=z.object({childName:z.string().trim().min(1).max(80),birthdayDate:z.string(),partyDate:z.string(),startTime:z.string(),invitationText:z.string().max(1000),locationText:z.string().max(250),mapsUrl:z.union([z.literal(""),httpUrlSchema]).optional(),phone:z.string().max(32).optional(),childImageUrl:z.union([z.literal(""),httpUrlSchema,invitationImageSchema]).optional()});
export const giftSchema=z.object({title:z.string().trim().min(1).max(180),url:httpUrlSchema,imageUrl:z.union([z.literal(""),httpUrlSchema]).optional(),priceText:z.string().max(80).optional(),retailer:z.enum(["skroutz","jumbo","other"])});
