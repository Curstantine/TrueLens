import { ObjectId } from "mongodb";
import { z } from "zod";

export const objectId = (message: string) => z.string().refine(ObjectId.isValid, message);
