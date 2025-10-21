"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { IChatMessage, IChatMessageCreate } from "@/lib/validations/chat";

export const createChatRoom = async (
  name: string,
  collectionCaseId: string,
  tenantId: string
) => {
  await prisma.chatRoom.create({
    data: {
      name,
      collectionCaseId,
      tenantId,
    },
  });
  revalidatePath("/dashboard/chat");
};

export const deleteChatRoom = async (chatRoomId: string) => {
  await prisma.chatRoom.delete({
    where: {
      id: chatRoomId,
    },
  });
  revalidatePath("/dashboard/chat");
};

export const saveMessage = async (params: IChatMessageCreate) => {
  await prisma.chatMessage.create({
    data: {
      roomId: params.roomId,
      senderId: params.senderId,
      message: params.message,
      fileUrl: params.fileUrl,
      fileName: params.fileName,
    },
  });
  revalidatePath("/dashboard/chat");
};

export const deleteMessage = async (messageId: string) => {
  await prisma.chatMessage.delete({
    where: {
      id: messageId,
    },
  });
  revalidatePath("/dashboard/chat");
};

export const getAllChatRoomsByTenantId = async (tenantId: string) => {
  return await prisma.chatRoom.findMany({
    where: {
      tenantId,
    },
    include: {
      messages: {
        include: {
          sender: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getChatRoomById = async (chatRoomId: string) => {
  return await prisma.chatRoom.findUnique({
    where: {
      id: chatRoomId,
    },
    include: {
      messages: {
        include: {
          sender: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const getMessagesByRoomId = async (
  chatRoomId: string
): Promise<IChatMessage[]> => {
  const messages = await prisma.chatMessage.findMany({
    where: {
      roomId: chatRoomId,
    },
    include: {
      sender: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages.map((msg) => ({
    id: msg.id,
    roomId: msg.roomId,
    senderId: msg.senderId,
    message: msg.message,
    fileUrl: msg.fileUrl,
    fileName: msg.fileName,
    timestamp: msg.createdAt,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  }));
};
