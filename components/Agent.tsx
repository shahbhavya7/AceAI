"use client";
import { vapi } from "@/lib/vapi.sdk";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from 'react'
import Image from "next/image";
import { cn } from "@/lib/utils";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  type,
  feedbackId,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

useEffect(() => { // this is react hook which will work when the component is mounted i.e. when the component is rendered , it tells our application
    // what it needds to do when certain states of conversation with vapi are triggered
    const onCallStart = () => { // this function will be called when the call starts , it will set the call status to active
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => { // this function will be called when the call ends , it will set the call status to finished
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => { // this function will be called when the message is received , it will set the last message to the message received
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => { // this function will be called when the speech starts , it will set the is speaking to true
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => { // this function will be called when the speech ends , it will set the is speaking to false
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => { // this function will be called when there is an error , it will log the error
      console.log("Error:", error);
    };

    // now we are forwarding the events to the functions we created above to vapi 
    vapi.on("call-start", onCallStart); 
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => { // this function will be called when the component is unmounted , it will remove the event listeners , so that we dont have memory leaks
      // for next time we will not have the same event listeners
      // this is important because if we dont remove the event listeners , it will keep listening to the events and will cause memory leaks
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);


useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
        const handleGenerateFeedback = async (messages: SavedMessage[]) => {
       console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({ // this function will be called when the call is finished and we need to generate feedback
        // it will call the createFeedback function from general.action.ts file by passing the interviewId, userId and messages generated during the call
        // captured by vapi and stored in messages state along with feedbackId if it exists and will return the success status and feedbackId from the db
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus,  interviewId, router, type, userId]);
  
 const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

     if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        clientMessages: [],
        serverMessages: [],
        variableValues: {
          username: userName,
          userid: userId,
        },
      }); 
    }else{ // if type is not generate then we are starting the call with interviewer providing the questions for interviewer to ask
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        clientMessages: [], // client messages are the messages sent by the user during the call
        serverMessages: [],
        variableValues: {
          questions: formattedQuestions, // they are the questions that the interviewer will ask during the call
          returnTranscript: true // this will return the transcript of the call i.e responses from the user and interviewer which will be used to generate feedback
          // this is important because we need to generate feedback based on the transcript of the call
        },
      });
    }
  }
  
  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
  
  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div >
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className='w-full flex justify-center'>
        {callStatus !== "ACTIVE" ? (
          <button className='relative btn-call' onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className='relative'>
              {isCallInactiveOrFinished ? 'Call' : ' . . .'}
            </span>
          </button>
        ) : (
          <button className='btn-disconnect' onClick={handleDisconnect}>
            END
          </button>
        )}
      </div>
    </>
  )
}


export default Agent