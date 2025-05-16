import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json(); // load the data from the vapi's api request and parse it to json , 
  // then save it in the variables

  try {
    const { text: questions } = await generateText({ // call the google model to generate the interview questions by passing the data to the model using the 
    // prompt and then save the response in the questions variable , text: questions means we are getting the text from the response and saving it in the 
    // questions variable
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

const interview = { // organize the data in the interview object to save it in the firebase database 
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions), // parse the questions to json format
      // this is because the response from the google model is in string format and we need to convert it to json format to save it in the database
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview); // save the interview object in the firebase database using the add method in collection named interviews

    return Response.json({ success: true }, { status: 200 }); // if the interview is saved successfully in the database then return success true with status 200
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}



export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

// What happens is Vapi workflow will give us the data in the body of the request i.e post request i.e. { type, role, level, techstack, amount, userid } 
// and we will use this data to generate the interview questions using the google model and then we will save the interview in the firebase database.
// which will be used to show the interview in the dashboard.
// The GET request is just a placeholder and can be used to test the API or return a success message.
// The POST request is the main function which will be used to generate the interview questions and save the interview in the database.
// The POST request will be called from the Vapi workflow providing us the data in the body of the request.