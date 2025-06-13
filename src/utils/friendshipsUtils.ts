/* eslint-disable @typescript-eslint/no-explicit-any */
import { FriendshipStatus } from "@/types";

export const mapFriendshipsToFrontend = (
  friendships: any[],
  currentUserId: number
): {
  friends: any[];
  pendingReceived: any[];
} => {
  const friends: any[] = [];
  const pendingReceived: any[] = [];

  for (const friendship of friendships) {
    const isSender = friendship.user_id === currentUserId;
    const otherUser = isSender ? friendship.receiver : friendship.sender;

    const frontendFriend = {
      id: otherUser.id,
      name: otherUser.name,
      avatar_url: otherUser.avatar_url,
      email: otherUser.email,
      user_goals: otherUser.user_goals,
      level: otherUser.level,
      status: friendship.status as FriendshipStatus,
    };

    if (friendship.status === "accepted") {
      friends.push(frontendFriend);
    } else if (friendship.status === "pending" && !isSender) {
      pendingReceived.push(frontendFriend);
    }
  }

  return { friends, pendingReceived };
};
