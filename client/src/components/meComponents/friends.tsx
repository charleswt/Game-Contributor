import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { 
  GET_FRIENDS, 
  GET_FRIEND_REQUESTS_INCOMMING, 
  GET_FRIEND_REQUESTS_OUTGOING,
  GET_USER
} from '../../utils/queries';
import { 
  ACCEPT_FRIENDSHIP, 
  DECLINE_FRIENDSHIP,
} from '../../utils/mutations';
import CookieAuth from '../../utils/auth';
import '../../../public/css/style.css';

interface Friend {
  id: string;
  userId1: string;
  userId2: string;
  request?: Boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export default function MeFriends() {
  const navigate = useNavigate()
  const { loading: loadingFriends, data: friendsData } = useQuery(GET_FRIENDS);
  const { loading: loadingIncomingRequests, data: incomingRequestsData } = useQuery(GET_FRIEND_REQUESTS_INCOMMING);
  const { loading: loadingOutgoingRequests, data: outgoingRequestsData } = useQuery(GET_FRIEND_REQUESTS_OUTGOING);
  const { loading: loadingFriend, data: friendData, refetch: refetchFriend } = useQuery(GET_USER, {
    skip: true
  });

  const [acceptFriendship] = useMutation(ACCEPT_FRIENDSHIP);
  const [declineFriendship] = useMutation(DECLINE_FRIENDSHIP);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Friend[]>([]);
  const [friendDetails, setFriendDetails] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    if (!loadingFriends && friendsData) {
      setFriends(friendsData.friends);
      friendsData.friends.forEach((friend: Friend) => {
        const friendId = JSON.stringify(CookieAuth.getTokenId) === friend.userId1 ? friend.userId2 : friend.userId1;
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
      setFriendDetails(prevDetails => ({
        ...prevDetails,
        [friendId]: data.user,
      }));
    }
  };

  const acceptFriendRequest = async (id: string) => {
    try {
      await acceptFriendship({ variables: { id } });
      setIncomingRequests(incomingRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const deleteFriendship = async (id: string) => {
    try {
      await declineFriendship({ variables: { id } });
      setFriends(friends.filter(friend => friend.id !== id));
      setIncomingRequests(incomingRequests.filter(request => request.id !== id));
      setOutgoingRequests(outgoingRequests.filter(request => request.id !== id));
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
        <p className='bg'>Friends</p>
        {friends.length ? (
          friends.map((friend: Friend) => {
            const friendId = JSON.stringify(CookieAuth.getTokenId) === friend.userId1 ? friend.userId2 : friend.userId1;
            const details = friendDetails[friendId];
            return (
              <div className='bg' key={friend.id}>
                {details ? (
                  <>
                    <div>{friend.userId1}</div>
                    <div>{friend.userId2}</div>
                    <div key={details.id}>
                      <p>{details.firstName}</p>
                      <p>{details.lastName}</p>
                      <p onClick={()=>navigate(`/user/${details.id}`)}>@{details.username}</p>
                    </div>
                    <button onClick={() => deleteFriendship(friend.id)}>Unfriend</button>
                  </>
                ) : (
                  <p>Loading details...</p>
                )}
              </div>
            );
          })
        ) : (
          <p className='bg'>No friends</p>
        )}
      </div>
      <div>
        <p className='bg'>Received Friend Requests</p>
        {incomingRequests.length ? (
          incomingRequests.map((request: Friend) => (
            <div className='bg' key={request.id}>
              <div>{request.userId1}</div>
              <div>{request.userId2}</div>
              <button onClick={() => acceptFriendRequest(request.id)}>Accept</button>
              <button onClick={() => deleteFriendship(request.id)}>Decline</button>
            </div>
          ))
        ) : (
          <p className='bg'>No incoming friend requests</p>
        )}
      </div>
      <div>
        <p className='bg'>Sent Friend Requests</p>
        {outgoingRequests.length ? (
          outgoingRequests.map((request: Friend) => (
            <div className='bg' key={request.id}>
              <div>{request.userId1}</div>
              <div>{request.userId2}</div>
              <button onClick={() => deleteFriendship(request.id)}>Cancel</button>
            </div>
          ))
        ) : (
          <p className='bg'>No outgoing friend requests</p>
        )}
      </div>
    </>
  );
}