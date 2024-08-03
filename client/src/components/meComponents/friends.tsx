import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  GET_FRIENDS,
  GET_FRIEND_REQUESTS_INCOMING,
  GET_FRIEND_REQUESTS_OUTGOING,
  GET_USER,
} from "../../utils/queries";
import { ACCEPT_FRIENDSHIP, DECLINE_FRIENDSHIP } from "../../utils/mutations";
import CookieAuth from "../../utils/auth";
import "../../../public/css/style.css";

interface Friend {
  id: string;
  userId1: string;
  userId2: string;
  request?: Boolean;
}

interface User {
  id: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface FriendAndUser {
  user: User;
  friend: Friend;
}

export default function MeFriends() {
  const navigate = useNavigate();
  const { loading: loadingFriends, data: friendsData } = useQuery(GET_FRIENDS);
  const { loading: loadingIncomingRequests, data: incomingRequestsData } =
    useQuery(GET_FRIEND_REQUESTS_INCOMING);
  const { loading: loadingOutgoingRequests, data: outgoingRequestsData } =
    useQuery(GET_FRIEND_REQUESTS_OUTGOING);
  const {
    loading: loadingFriend,
    data: friendData,
    refetch: refetchFriend,
  } = useQuery(GET_USER, {
    skip: true,
  });

  const [acceptFriendship] = useMutation(ACCEPT_FRIENDSHIP);
  const [declineFriendship] = useMutation(DECLINE_FRIENDSHIP);

  const [friends, setFriends] = useState<FriendAndUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendAndUser[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendAndUser[]>([]);
  const [friendDetails, setFriendDetails] = useState<{ [key: string]: User }>(
    {}
  );

  useEffect(() => {
    if (!loadingFriends && friendsData) {
      setFriends(friendsData.friends);
      friendsData.friends.forEach((friend: Friend) => {
        const friendId =
          JSON.stringify(CookieAuth.getTokenId) === friend.userId1
            ? friend.userId2
            : friend.userId1;
        fetchFriendDetails(friendId);
      });
    }
  }, [loadingFriends, friendsData]);

  useEffect(() => {
    if (!loadingIncomingRequests && incomingRequestsData) {
      setIncomingRequests(incomingRequestsData.friendRequestsIncoming);
    }
  }, [loadingIncomingRequests, incomingRequestsData]);

  useEffect(() => {
    if (!loadingOutgoingRequests && outgoingRequestsData) {
      setOutgoingRequests(outgoingRequestsData.friendRequestsOutgoing);
    }
  }, [loadingOutgoingRequests, outgoingRequestsData]);

  const fetchFriendDetails = async (friendId: string) => {
    const { data } = await refetchFriend({ id: friendId });
    if (data) {
      setFriendDetails((prevDetails) => ({
        ...prevDetails,
        [friendId]: data.user,
      }));
    }
  };

  const acceptFriendRequest = async (id: string) => {
    try {
      await acceptFriendship({ variables: { id } });
      setIncomingRequests(
        incomingRequests.filter((request) => request.friend.id !== id)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const deleteFriendship = async (id: string) => {
    try {
      await declineFriendship({ variables: { id } });
      setFriends(friends.filter((friend) => friend.friend.id !== id));
      setIncomingRequests(
        incomingRequests.filter((request) => request.friend.id !== id)
      );
      setOutgoingRequests(
        outgoingRequests.filter((request) => request.friend.id !== id)
      );
    } catch (error) {
      console.error("Error deleting friendship:", error);
    }
  };

  if (loadingFriends || loadingIncomingRequests || loadingOutgoingRequests) {
    return <div className="loader"></div>;
  }

  return (
    <>
      <div>
        <p className="bg">Friends</p>
        {friends.length ? (
          friends.map((friend: FriendAndUser) => {
            const friendId =
              JSON.stringify(CookieAuth.getTokenId) === friend.friend.userId1
                ? friend.friend.userId2
                : friend.friend.userId1;
            const details = friendDetails[friendId];
            return (
              <div className="bg" key={friend.friend.id}>
                {details ? (
                  <>
                      <img src={friend.user.profileImage} alt="profile picture" />
                      <p>{friend.user.firstName}</p>
                      <p>{friend.user.lastName}</p>
                      <p onClick={() => navigate(`/user/${friend.user.id}`)}>
                        @{friend.user.username}
                      </p>
                    <button onClick={() => deleteFriendship(friend.friend.id)}>
                      Unfriend
                    </button>
                  </>
                ) : (
                  <p>Loading details...</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="bg">No friends</p>
        )}
      </div>
      <div>
        <p className="bg">Received Friend Requests</p>
        {incomingRequests.length ? (
          incomingRequests.map((request: FriendAndUser) => (
            <div className="bg friend-profile" key={request.friend.id}>
              <img
                  src={request.user.profileImage}
                  alt="profile picture"
                />
                <p>{request.user.firstName}</p>
                <p>{request.user.lastName}</p>
                <p onClick={() => navigate(`/user/${request.user.id}`)}>
                  @{request.user.username}
                </p>
              <button onClick={() => acceptFriendRequest(request.friend.id)}>
                Accept
              </button>
              <button onClick={() => deleteFriendship(request.friend.id)}>
                Decline
              </button>
            </div>
          ))
        ) : (
          <p className="bg">No incoming friend requests</p>
        )}
      </div>
      <div>
        <p className="bg">Sent Friend Requests</p>
        {outgoingRequests.length ? (
          outgoingRequests.map((request: FriendAndUser) => (
            <div className="bg friend-profile" key={request.user.id}>
                <img
                  src={request.user.profileImage}
                  alt="profile picture"
                />
                <p>{request.user.firstName}</p>
                <p>{request.user.lastName}</p>
                <p onClick={() => navigate(`/user/${request.user.id}`)}>
                  @{request.user.username}
                </p>
              <button onClick={() => deleteFriendship(request.friend.id)}>
                Cancel
              </button>
            </div>
          ))
        ) : (
          <p className="bg">No outgoing friend requests</p>
        )}
      </div>
    </>
  );
}
