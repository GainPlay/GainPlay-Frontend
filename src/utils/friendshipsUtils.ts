import { FrontendFriend, FriendshipStatus, UserGoal } from "@/types";

export const mapFriendshipsToFrontend = (
  friendships: any[],
  currentUserId: number
): {
  friends: FrontendFriend[];
  pendingReceived: FrontendFriend[];
} => {
  const friends: FrontendFriend[] = [];
  const pendingReceived: FrontendFriend[] = [];

  for (const friendship of friendships) {
    const isSender = friendship.user_id === currentUserId;
    const otherUser = isSender ? friendship.receiver : friendship.sender;

    const frontendFriend: FrontendFriend = {
      id: otherUser.id,
      name: otherUser.name,
      avatar: otherUser.avatar_url,
      email: otherUser.email,
      goals: otherUser.user_goals.map((userGoal: UserGoal) => userGoal.goals.name) || [], // safe default
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
