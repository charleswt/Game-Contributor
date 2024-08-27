import '../../../public/css/style.css';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PUBLISHED_CODE } from '../../utils/queries';

interface Code {
  id: string;
  userId: string;
  companyId: string;
  code: string;
  createdAt: string;
}

export default function MeCode() {
  const { loading: codeLoading, data: codeData } = useQuery(GET_PUBLISHED_CODE);
  const [pubdCodes, setPubdCodes] = useState<Code[]>([]);

  useEffect(() => {
    if (codeData) {
      setPubdCodes(codeData.publishedCode);
      console.log(codeData)
    }
  }, [!codeLoading, codeData]);
  if (codeLoading) {
    return <div className="loader"></div>;
  }

  return (
    <>
    {pubdCodes.length > 0 && <div className='bg'>Sent Code</div>}
      {pubdCodes.length > 0 ? (
        pubdCodes.map((code: Code) => (
          <div className="bg" key={code.id}>
            <div>{code.id}</div>
            <div>{code.userId}</div>
            <div>{code.companyId}</div>
            <div>{code.code}</div>
            <div>{code.createdAt}</div>
          </div>
        ))
      ) : (
        <div className="bg">You Have No Published Code</div>
      )}
    </>
  );
}