import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER, GET_FRIEND } from '../../utils/queries';
import { CREATE_FRIENDSHIP } from '../../utils/mutations';
import CookieAuth from '../../utils/auth';

interface Company {
  id: string;
  companyName: string;
  userId: string;
}

interface User {
  id: string;
  bio: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  username: string;
  company?: Company;
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
    if (!loading && data.user.user) {
      setUser(data.user.user);
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
      <div className="bg myProfile">
      <div className='user-pfp'>
      <img src={user.profileImage || '../../../public/images/defaultPfp.png'} alt="profile picture" />
        </div>
        <div className='user-name'>
            <div>
              <h1>{user.firstName} {user.lastName}</h1>
              <p>@{user.username}</p></div>
              <div>
                <div>{user.bio}</div>
                </div>
          </div>
        {!loading && data && JSON.stringify(CookieAuth.getTokenId()) !== user.id ? <button onClick={handleAddFriend} disabled={friendshipLoading}>
          {friendshipLoading ? 'Adding friend...' : 'Add friend'}</button>
          :""
        }

        {error && <div>Error adding friend. Please try again later.</div>}
      </div>
    </main>
  );
}