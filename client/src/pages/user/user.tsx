import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../../utils/queries';

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
    variables: { id }
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && data) {
      setUser(data.user);
    }
  }, [loading, data]);

  if (loading) {
    return <div className="loader"></div>;
  }

  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <main>
        <div className='bg userProfile'>
        <h1>{user.firstName} {user.lastName}</h1>
        <p>@{user.username}</p>

        <button>Add friend</button>
        </div>
    </main>
    
  );
}