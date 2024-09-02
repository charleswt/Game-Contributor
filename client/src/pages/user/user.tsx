import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER, GET_FRIEND, GET_PUBLISHED_CODES } from '../../utils/queries';
import { CREATE_FRIENDSHIP, CREATE_PUBLISHED_CODE } from '../../utils/mutations';
import CookieAuth from '../../utils/auth';
import { formatDate } from "../../utils/utils"

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
}

interface UserProfileData {
  user: User;
  company?: Company;
}

interface allCode {
  id: string;
  userId: string;
  companyId: string;
  code: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  username: string;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { loading, data } = useQuery<{ user: UserProfileData }>(GET_USER, {
    variables: { id },
  });
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [createFriendship, { loading: friendshipLoading, error }] = useMutation(
    CREATE_FRIENDSHIP,
    {
      onError: (error) => {
        console.error('Error creating friendship:', error);
      },
    }
  );
  const { data: friendData, loading: loadingFriendData } = useQuery(GET_FRIEND, {
    variables: { id },
  });

  const [createPublishedCode] = useMutation(CREATE_PUBLISHED_CODE);
  const [codeLink, setCodeLink] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  
  const { loading: loadingCode, data: codeData } = useQuery(GET_PUBLISHED_CODES, {
    variables: { companyId: data?.user.company?.id }
  })
  const [allCode, setAllCode] = useState<allCode[]>()

  useEffect(() => {
    if (!loading && data && data.user) {
      setUser({ user: data.user.user, company: data.user.company });
    }
  }, [loading, data]);

  useEffect(() => {
    if (!loadingCode && codeData) {
      setAllCode(codeData.publishedCodesByCompany)
    }
    console.log(allCode, "93")
  }, [loadingCode, codeData]);

  const handlePublishCode = async (companyId: string, code: string) => {
    try {
      await createPublishedCode({
        variables: { userId: CookieAuth.getTokenId(), companyId, code },
      });
      setCodeSent(true);
      setCodeLink("")
    } catch (error) {
      console.error('Error publishing code:', error);
    }
  };

  const handleAddFriend = () => {
    if (user && user.user.id) {
      createFriendship({
        variables: { id: user.user.id },
      });
    }
  };

  if (loading || loadingFriendData) {
    return <div className="loader"></div>;
  }

  if (!user) {
    return <div>No user found.</div>;
  }

  const { user: userData, company: companyData } = user;

  return (
    <main>
      <div className="bg myProfile">
        <div className="user-pfp">
          <img
            src={userData.profileImage || '../../../public/images/defaultPfp.png'}
            alt="profile picture"
          />
        </div>
        <div className="user-name">
          <div>
            <h1>{userData.firstName} {userData.lastName}</h1>
            <p>@{userData.username}</p>
          </div>
          <div>
            <div>{userData.bio}</div>
          </div>
        </div>
        {CookieAuth.getTokenId() !== userData.id && (
          <button onClick={handleAddFriend} disabled={friendshipLoading}>
            {friendshipLoading ? 'Adding friend...' : 'Add friend'}
          </button>
        )}

        {error && <div>Error adding friend. Please try again later.</div>}
      </div>

      {companyData && (
        <>
          <div className="bg">{companyData.companyName}</div>

          {codeSent && <p className='bg'>Code sent successfully!</p>}
          <div className="bg">
            <h2>Share code to contribute towards company code bases and earn stars if your code is approved for use!</h2>
            <div className='comment-reply'>
              <textarea 
              placeholder="Link to code here..."
              name="codeLink"
              rows={1}
              cols={35}
              maxLength={35}
              value={codeLink}
              style={{ overflow: 'hidden', resize: 'none' }}
              onChange={(e) => setCodeLink(e.target.value)}
            /></div>
            <button
              onClick={() => handlePublishCode(companyData.id, codeLink)}
              disabled={!codeLink.trim()}
            >
              Submit Code
            </button>
          </div>

          {allCode?.map((code: allCode)=>(        
            <div className='bg' key={code.id}>
        <p>
        <strong>Submitted by:</strong> {code.firstName} {code.lastName} (@{code.username})
      </p>
      <p>
        <strong>User ID:</strong> {code.userId}
      </p>
      <p>
        <strong>Company ID:</strong> {code.companyId}
      </p>
      <p>
        <strong>Code Snippet:</strong> <code>{code.code}</code>
      </p>
      <p>
        <strong>Submitted on:</strong> {formatDate(code.createdAt)}
      </p>
      </div>
      ))}

        </>
      )}
    </main>
  );
}