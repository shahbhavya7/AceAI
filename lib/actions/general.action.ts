"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";

export async function createFeedback(params: CreateFeedbackParams) { // create feedback for the interview using the google gemini model by passing the interviewId, userId, transcript and feedbackId
  // createFeedbackParams is an object that contains the interviewId, userId, transcript and feedbackId , this object comes from the client side
  const { interviewId, userId, transcript, feedbackId } = params; 

  try {
    const formattedTranscript = transcript // format the transcript to be used in the prompt, transcript is saved in the db
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({ // generate the feedback using the google gemini model
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false }; // return false if there is an error while saving the feedback
  }
}


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

export async function getFeedbackByInterviewId( // It fetches the feedback for a specific interview ID and user ID from the database.
  params: GetFeedbackByInterviewIdParams  // GetFeedbackByInterviewIdParams is an object that contains the interviewId and userId , it is user defined in the lib/actions/general.action.ts file
  // in typescript we can define params like this to make it more readable
): Promise<Feedback | null> { // promise in typescript is a promise that will be resolved or rejected in the future
  const { interviewId, userId } = params;

  const querySnapshot = await db // get the feedback from db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1) // limit the number of feedbacks to 1
    .get();

  if (querySnapshot.empty) return null; // return null if there is no feedback

  const feedbackDoc = querySnapshot.docs[0]; // get the first feedback from the querySnapshot
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback; // return { id: feedbackDoc.id, ...feedbackDoc.data() } means return the id and the data of the feedback 
  // ...feedbackDoc.data() means return all the data of the feedback doc
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