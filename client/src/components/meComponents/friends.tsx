import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FRIENDS } from '../../utils/queries';
import '../../../public/css/style.css';

interface Friend {
  id: string;
  userId1: string;
  userId2: string;
  request?: Boolean;
}

export default function MeFriends() {
  const { loading: loadingFriends, data: friendsData } = useQuery(GET_FRIENDS);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (!loadingFriends && friendsData) {
      setFriends(friendsData.friends);
    }
  }, [loadingFriends, friendsData]);

  if (loadingFriends) {
    return <div className="loader"></div>;
  }

  return (
    <div>
      <p className='bg'>Your Friends</p>
      {friends.length > 0 ? (
        friends.map((friend: Friend) => (
          <div className='bg' key={friend.id}>
            <div>{friend.userId1}</div>
            <div>{friend.userId2}</div>
          </div>
        ))
      ) : (
        <p>No friends</p>
      )}
    </div>
  );
}