"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";


export async function getInterviewsByUserId( // get interviews by user id from db
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({ // map the interviews to return the data
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews( // get latest interviews from db of other users
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> { // fetches single interview by id to show the details of the interview that user has taken
  const interview = await db.collection("interviews").doc(id).get(); // doc is a method to get the document by id in the collection 

  return interview.data() as Interview | null; // return the data of the interview or null if not found
}