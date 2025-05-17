"use client";
import { vapi } from "@/lib/vapi.sdk";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from 'react'
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => { // this is react hook which will work when the component is mounted i.e. when the component is rendered
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
              key={lastMessage}
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
          <button className='relative btn-call'>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className='relative'>
              {callStatus === "INACTIVE" || callStatus === "FINISHED" ? 'Call' : ' . . .'}
            </span>
          </button>
        ) : (
          <button className='btn-disconnect'>
            END
          </button>
        )}
      </div>
    </>
  )
}

export default Agent