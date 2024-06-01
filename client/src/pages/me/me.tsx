import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../../utils/queries';
import '../../../public/css/style.css';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  // Add other fields as necessary
}

export default function Me(): any {
  const { loading, data } = useQuery(GET_ME);
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && data) {
      setMe(data.me.user);
    }
  }, [loading, data]);

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <main>
      <div>hello</div>
      {me ? (
        <div>
          <p>{me.firstName} {me.lastName}</p>
          <p>Username: {me.username}</p>
          <p>Email: {me.email}</p>
        </div>
      ) : (
        <p>No Data</p>
      )}
    </main>
  );
}