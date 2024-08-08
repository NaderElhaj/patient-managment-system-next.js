"use server"
import { ID, Query } from "node-appwrite";
import { databases, messaging } from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";
export  const  sendSMSNotification = async(userId:string,content:string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    )
    return parseStringify(message)
  } catch (error) {
    console.log(error)
  }
}
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );
    return parseStringify(newAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const getAppointment = async(appointmentId: string) => {
    try {
        const appointment = await databases.getDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
            appointmentId

        )
        return parseStringify(appointment)
    } catch (error) {
        console.log(error)
    }
};

export const getRecentAppointmentList = async()=>{
  try {
    const appointments = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    )
    const initialCounts = {
      scheduledCount: 0,
      pendingCount : 0,
      cancelledCount : 0
    }

    const counts = (appointments.documents as Appointment[]).reduce((acc,appointment)=>{
      if(appointment.status === 'scheduled'){
        acc.scheduledCount +=1
      }
      if(appointment.status === 'pending'){
        acc.pendingCount +=1
      }
      if(appointment.status === 'cancelled'){
        acc.cancelledCount +=1
      }
      return acc
    },initialCounts)
    const data = {
      totalCount : appointments.total,
      ... counts ,
      documents : appointments.documents

    }
    return parseStringify(data)
  } catch (error) {
    console.log(error)
  }
}
export const updateAppointment = async({appointmentId,userId,appointment,type}:UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    )
    if(!updateAppointment){
      throw new Error("Appointment not found")
    }else {
      const  smsMessage = `
      Hi,it's Careplus.
      Your appointment has been 
      ${type === "schedule"? `scheduled for ${formatDateTime(appointment.schedule!).dateTime}`:`cancelled For the following reason ${appointment.cancellationReason}` }`
      await sendSMSNotification(userId,smsMessage)
    }
    revalidatePath('/admin');
    return parseStringify(updatedAppointment)
  } catch (error) {
    console.log(error)
  }
} 
