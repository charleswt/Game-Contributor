import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER, GET_FRIEND } from '../../utils/queries';
import { CREATE_FRIENDSHIP } from '../../utils/mutations';

interface User {
  id: string;
  profilePicture?: string;
  firstName: string;
  lastName: string;
  username: string;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { loading, data } = useQuery(GET_USER, {
    variables: { id },
  });
  const [user, setUser] = useState<User | null>(null);
  const [createFriendship, { loading: friendshipLoading, error }] = useMutation(
    CREATE_FRIENDSHIP,
    {
      onError: (error) => {
        console.error('Error creating friendship:', error);
      },
    }
  );
  const { data: friendData, loading: loadingFriendData} = useQuery(GET_FRIEND, {
    variables: { id }
  });

  useEffect(() => {
    if (!loading && data) {
      setUser(data.user);
    }
  }, [loading, data]);

  const handleAddFriend = () => {
    if (user && user.id) {
      createFriendship({
        variables: { id: user.id },
      })
    }
  };

  if (loading || loadingFriendData) {
    return <div className="loader"></div>;
  }

  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <main>
      <div className="bg userProfile">
        <h1>
          {user.firstName} {user.lastName}
        </h1>
        <p>@{user.username}</p>

        {!loadingFriendData && friendData ? "" : <button onClick={handleAddFriend} disabled={friendshipLoading}>
          {friendshipLoading ? 'Adding friend...' : 'Add friend'}
        </button>}

        {error && <div>Error adding friend. Please try again later.</div>}
      </div>
    </main>
  );
}