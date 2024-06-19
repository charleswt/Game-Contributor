import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_FRIENDS, 
  GET_FRIEND_REQUESTS_INCOMMING, 
  GET_FRIEND_REQUESTS_OUTGOING 
} from '../../utils/queries';
import { 
  ACCEPT_FRIENDSHIP, 
  DECLINE_FRIENDSHIP,
} from '../../utils/mutations';
import '../../../public/css/style.css';

interface Friend {
  id: string;
  userId1: string;
  userId2: string;
  request?: Boolean;
}

export default function MeFriends() {
  const { loading: loadingFriends, data: friendsData } = useQuery(GET_FRIENDS);
  const { loading: loadingIncomingRequests, data: incomingRequestsData } = useQuery(GET_FRIEND_REQUESTS_INCOMMING);
  const { loading: loadingOutgoingRequests, data: outgoingRequestsData } = useQuery(GET_FRIEND_REQUESTS_OUTGOING);
  const [acceptFriendship] = useMutation(ACCEPT_FRIENDSHIP)
  const [declineFriendship] = useMutation(DECLINE_FRIENDSHIP)

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Friend[]>([]);

  useEffect(() => {
    if (!loadingFriends && friendsData) {
      setFriends(friendsData.friends);
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

  if (loadingFriends || loadingIncomingRequests || loadingOutgoingRequests) {
    return <div className="loader"></div>;
  }

  async function acceptFriendRequest(id:any){
    const { data } = await acceptFriendship({ 
      variables: { id }
    })
    return data
  }

  async function declineFriendRequest(id:any){
    const { data } = await declineFriendship({ 
      variables: { id }
    })
    return data
  }

  return (
    <>
      <div>
        
        {friends.length ? (
          friends.map((friend: Friend) => (<>
          <p className='bg'>Your Friends</p>
            <div className='bg' key={friend.id}>
              <div>{friend.userId1}</div>
              <div>{friend.userId2}</div>
            </div>
          </>))
        ) : (
          <p className='bg'>No friends</p>
        )}
      </div>
      <div>
        
        {incomingRequests ? (
          incomingRequests.map((request: Friend) => (<>
          <p className='bg'>Received Friend Requests</p>
            <div className='bg' key={request.id}>
              <div>{request.userId1}</div>
              <div>{request.userId2}</div>
              <button onClick={()=>acceptFriendRequest(request.id)}>Accept</button>
              <button onClick={()=>declineFriendRequest(request.id)}>Decline</button>
            </div>
          </>))
        ) : (
          <p className='bg'>No incoming friend requests</p>
        )}
      </div>
      <div>
        
        {outgoingRequests ? (
          outgoingRequests.map((request: Friend) => (<>
          <p className='bg'>Sent Friend Requests</p>
            <div className='bg' key={request.id}>
              <div>{request.userId1}</div>
              <div>{request.userId2}</div>
              <button onClick={()=>declineFriendRequest(request.id)}>Cancel</button>
            </div>
          </>))
        ) : (
          <p className='bg'>No outgoing friend requests</p>
        )}
      </div>
    </>
  );
}